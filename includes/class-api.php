<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles all communication with the Moondream Cloud vision API.
 */
class Moondream_Api {

	/**
	 * Supported image MIME types.
	 *
	 * @var string[]
	 */
	private static $supported_mime_types = array(
		'image/jpeg',
		'image/png',
		'image/gif',
		'image/webp',
		'image/avif',
		'image/bmp',
		'image/tiff',
	);

	// -------------------------------------------------------------------------
	// Public interface
	// -------------------------------------------------------------------------

	/**
	 * Generate alt text for a WordPress attachment.
	 *
	 * @param int $attachment_id
	 * @return array|WP_Error Array with keys 'text' (string) and 'was_truncated' (bool) on success.
	 */
	public function generate_alt_text( $attachment_id ) {
		$preflight = $this->preflight_checks( $attachment_id );
		if ( is_wp_error( $preflight ) ) {
			return $preflight;
		}

		$image_url = wp_get_attachment_url( $attachment_id );
		$prompt    = $this->assemble_prompt( $this->get_clean_filename( $attachment_id ) );

		// First attempt: send the public image URL directly.
		$result = $this->api_request( array( 'image_url' => $image_url ), $prompt );

		// If the API could not access the URL, fall back to base64.
		if ( is_wp_error( $result ) && $result->get_error_code() === 'access_error' ) {
			$result = $this->api_request_base64_from_url( $image_url, $prompt );
		}

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return $this->truncate_response( $result );
	}

	/**
	 * Test the API with a known public image URL, bypassing attachment validation.
	 * Used by the settings page test button.
	 *
	 * @return array|WP_Error
	 */
	public function test_with_url() {
		$api_key = get_option( 'moondream_api_key', '' );
		if ( empty( $api_key ) ) {
			return new WP_Error(
				'no_api_key',
				__( 'No API key configured. Please visit Settings > Moondream Alt Text.', 'moondream-alt-text' )
			);
		}

		// Stable Wikimedia Commons test image (freely licensed photograph).
		$test_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png';
		$prompt   = $this->assemble_prompt();
		$result   = $this->api_request( array( 'image_url' => $test_url ), $prompt );

		if ( is_wp_error( $result ) && $result->get_error_code() === 'access_error' ) {
			$result = $this->api_request_base64_from_url( $test_url, $prompt );
		}

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return array( 'text' => $result );
	}

	// -------------------------------------------------------------------------
	// Pre-flight checks
	// -------------------------------------------------------------------------

	/**
	 * Run pre-flight checks before making an API request.
	 *
	 * @param int $attachment_id
	 * @return true|WP_Error
	 */
	private function preflight_checks( $attachment_id ) {
		// 1. API key.
		$api_key = get_option( 'moondream_api_key', '' );
		if ( empty( $api_key ) ) {
			return new WP_Error(
				'no_api_key',
				__( 'No API key configured. Please visit Settings > Moondream Alt Text.', 'moondream-alt-text' )
			);
		}

		// 2. Valid attachment.
		if ( get_post_type( $attachment_id ) !== 'attachment' ) {
			return new WP_Error(
				'invalid_attachment',
				__( 'Invalid attachment ID.', 'moondream-alt-text' )
			);
		}

		// 3. Supported file type (check MIME type stored in post).
		$mime_type = get_post_mime_type( $attachment_id );
		if ( ! in_array( $mime_type, self::$supported_mime_types, true ) ) {
			return new WP_Error(
				'invalid_format',
				__( 'This image format is not supported.', 'moondream-alt-text' )
			);
		}

		// 4. File size (read from disk if possible; fall back gracefully).
		$file_path = get_attached_file( $attachment_id );
		if ( $file_path && file_exists( $file_path ) ) {
			$file_size = filesize( $file_path );
			if ( $file_size !== false && $file_size > MOONDREAM_MAX_FILE_SIZE ) {
				return new WP_Error(
					'file_too_large',
					__( 'This image exceeds the maximum file size for the API.', 'moondream-alt-text' )
				);
			}
		}

		return true;
	}

	// -------------------------------------------------------------------------
	// Prompt assembly
	// -------------------------------------------------------------------------

	/**
	 * Assemble the prompt string sent as the `question` parameter.
	 *
	 * @param string $filename Optional cleaned filename (without extension) to hint context.
	 * @return string
	 */
	private function assemble_prompt( $filename = '' ) {
		$prompt = 'Write alt text for this image. '
			. 'Output the alt text directly — no introduction, no phrases like "The image shows", "This image depicts", or "A photo of", no closing punctuation. '
			. 'Start with the subject. Keep it to a single brief sentence.';

		if ( ! empty( $filename ) ) {
			$prompt .= "\nThe file is named '" . $filename . "'.";
		}

		$context = get_option( 'moondream_global_context', '' );
		if ( ! empty( $context ) ) {
			$prompt .= "\n" . $context;
		}

		return $prompt;
	}

	/**
	 * Return a human-readable version of an attachment's filename.
	 * Strips the extension and replaces hyphens/underscores with spaces.
	 *
	 * @param int $attachment_id
	 * @return string Empty string if the file path cannot be determined.
	 */
	private function get_clean_filename( $attachment_id ) {
		$file_path = get_attached_file( $attachment_id );
		if ( ! $file_path ) {
			return '';
		}

		$raw = pathinfo( wp_basename( $file_path ), PATHINFO_FILENAME );
		if ( empty( $raw ) ) {
			return '';
		}

		// Replace hyphens, underscores, and runs of whitespace with a single space.
		$clean = preg_replace( '/[-_]+/', ' ', $raw );
		$clean = preg_replace( '/\s+/', ' ', $clean );
		return trim( $clean );
	}

	// -------------------------------------------------------------------------
	// API requests
	// -------------------------------------------------------------------------

	/**
	 * Send a request to the Moondream /query endpoint.
	 *
	 * @param array  $image_data  Either [ 'image_url' => 'https://...' ] or [ 'image_url' => 'data:image/jpeg;base64,...' ]
	 * @param string $prompt
	 * @return string|WP_Error Raw answer string on success.
	 */
	private function api_request( array $image_data, $prompt ) {
		$api_key = get_option( 'moondream_api_key', '' );

		$body = wp_json_encode(
			array_merge(
				$image_data,
				array( 'question' => $prompt )
			)
		);

		$response = wp_remote_post(
			MOONDREAM_API_ENDPOINT,
			array(
				'timeout' => 15,
				'headers' => array(
					'X-Moondream-Auth' => $api_key,
					'Content-Type'     => 'application/json',
				),
				'body'    => $body,
			)
		);

		return $this->parse_response( $response );
	}

	/**
	 * Fetch an image from any URL, base64-encode it, and send to the API.
	 *
	 * @param string $image_url
	 * @param string $prompt
	 * @return string|WP_Error
	 */
	private function api_request_base64_from_url( $image_url, $prompt ) {
		$fetch = wp_remote_get(
			$image_url,
			array( 'timeout' => 15 )
		);

		if ( is_wp_error( $fetch ) ) {
			return new WP_Error(
				'image_not_accessible',
				__( 'The image could not be retrieved. It may not be publicly accessible.', 'moondream-alt-text' )
			);
		}

		$code = wp_remote_retrieve_response_code( $fetch );
		if ( $code !== 200 ) {
			return new WP_Error(
				'image_not_accessible',
				__( 'The image could not be retrieved. It may not be publicly accessible.', 'moondream-alt-text' )
			);
		}

		$raw_body  = wp_remote_retrieve_body( $fetch );
		$mime_type = wp_remote_retrieve_header( $fetch, 'content-type' );

		// Strip any parameters (e.g. "image/jpeg; charset=...").
		if ( strpos( $mime_type, ';' ) !== false ) {
			$mime_type = trim( explode( ';', $mime_type )[0] );
		}

		// Default to jpeg if the header is missing or unhelpful.
		if ( empty( $mime_type ) || strpos( $mime_type, 'image/' ) === false ) {
			$mime_type = 'image/jpeg';
		}

		$data_uri = 'data:' . $mime_type . ';base64,' . base64_encode( $raw_body ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode

		return $this->api_request( array( 'image_url' => $data_uri ), $prompt );
	}

	// -------------------------------------------------------------------------
	// Response parsing
	// -------------------------------------------------------------------------

	/**
	 * Parse the raw wp_remote_post response.
	 *
	 * @param array|WP_Error $response
	 * @return string|WP_Error Raw answer string on success.
	 */
	private function parse_response( $response ) {
		if ( is_wp_error( $response ) ) {
			$message = $response->get_error_message();
			if ( stripos( $message, 'timed out' ) !== false ) {
				return new WP_Error(
					'timeout',
					__( 'The request timed out. The image may be too large or the API unresponsive.', 'moondream-alt-text' )
				);
			}
			return new WP_Error(
				'network_error',
				__( 'Network error. Please check your connection and try again.', 'moondream-alt-text' )
			);
		}

		$code = wp_remote_retrieve_response_code( $response );
		$body = wp_remote_retrieve_body( $response );

		switch ( true ) {
			case $code === 401:
				return new WP_Error(
					'invalid_api_key',
					__( 'API key invalid or missing. Please check Settings > Moondream Alt Text.', 'moondream-alt-text' )
				);
			case $code === 429:
				return new WP_Error(
					'rate_limit',
					__( 'Rate limit reached. Please wait a moment and try again.', 'moondream-alt-text' )
				);
			case $code === 400 || $code === 422:
				// Signal to the caller to retry with base64.
				return new WP_Error( 'access_error', '' );
			case $code >= 500:
				return new WP_Error(
					'api_unavailable',
					sprintf(
						/* translators: %d: HTTP status code */
						__( 'The API returned a server error (HTTP %d). Please try again later.', 'moondream-alt-text' ),
						$code
					)
				);
			case $code !== 200:
				return new WP_Error(
					'api_error',
					sprintf(
						/* translators: %d: HTTP status code */
						__( 'Unexpected API response (HTTP %d).', 'moondream-alt-text' ),
						$code
					)
				);
		}

		$data = json_decode( $body, true );

		if ( ! is_array( $data ) || ! isset( $data['answer'] ) || $data['answer'] === '' ) {
			return new WP_Error(
				'empty_response',
				__( 'The API returned an empty response. Try again or check your prompt context.', 'moondream-alt-text' )
			);
		}

		return (string) $data['answer'];
	}

	// -------------------------------------------------------------------------
	// Truncation
	// -------------------------------------------------------------------------

	/**
	 * Trim the API response to within the hard character limit.
	 *
	 * @param string $text
	 * @return array { text: string, was_truncated: bool }
	 */
	private function truncate_response( $text ) {
		$text          = trim( $text );
		$was_truncated = false;

		if ( mb_strlen( $text ) > MOONDREAM_HARD_CHAR_LIMIT ) {
			// Trim to limit + 1 so we can search for a word boundary within range.
			$trimmed = mb_substr( $text, 0, MOONDREAM_HARD_CHAR_LIMIT + 1 );
			// Walk back to the last space at or before the hard limit.
			$last_space = mb_strrpos( mb_substr( $trimmed, 0, MOONDREAM_HARD_CHAR_LIMIT ), ' ' );
			if ( $last_space !== false ) {
				$text = mb_substr( $trimmed, 0, $last_space );
			} else {
				// No space found — hard-cut at the limit.
				$text = mb_substr( $trimmed, 0, MOONDREAM_HARD_CHAR_LIMIT );
			}
			$was_truncated = true;
		}

		return array(
			'text'          => $text,
			'was_truncated' => $was_truncated,
		);
	}
}
