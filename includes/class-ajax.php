<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers and handles all wp_ajax_ actions for the plugin.
 */
class Moondream_Ajax {

	/**
	 * @var Moondream_Api
	 */
	private $api;

	/**
	 * @param Moondream_Api $api
	 */
	public function __construct( Moondream_Api $api ) {
		$this->api = $api;

		add_action( 'wp_ajax_moondream_generate_single',       array( $this, 'handle_generate_single' ) );
		add_action( 'wp_ajax_moondream_generate_bulk',         array( $this, 'handle_generate_bulk' ) );
		add_action( 'wp_ajax_moondream_generate_bulk_base64',  array( $this, 'handle_generate_bulk_base64' ) );
		add_action( 'wp_ajax_moondream_save_alt_text',         array( $this, 'handle_save_alt_text' ) );
		add_action( 'wp_ajax_moondream_test_api',              array( $this, 'handle_test_api' ) );
		add_action( 'wp_ajax_moondream_get_no_alt_ids',        array( $this, 'handle_get_no_alt_ids' ) );
	}

	// -------------------------------------------------------------------------
	// Single-image generation
	// -------------------------------------------------------------------------

	/**
	 * Handle a single-image generation request.
	 *
	 * Does NOT write the alt text meta — JS writes it after the user clicks Accept.
	 */
	public function handle_generate_single() {
		check_ajax_referer( 'moondream_alt_text_nonce', 'nonce' );

		if ( ! current_user_can( 'upload_files' ) ) {
			wp_send_json_error(
				array( 'message' => __( 'You do not have permission to perform this action.', 'moondream-alt-text' ) ),
				403
			);
		}

		$attachment_id = absint( isset( $_POST['attachment_id'] ) ? $_POST['attachment_id'] : 0 );
		if ( ! $attachment_id ) {
			wp_send_json_error( array( 'message' => __( 'Invalid attachment ID.', 'moondream-alt-text' ) ) );
		}

		$result = $this->api->generate_alt_text( $attachment_id );

		if ( is_wp_error( $result ) ) {
			wp_send_json_error( array( 'message' => $result->get_error_message() ) );
		}

		// Record generation timestamp (not a content cache).
		update_post_meta( $attachment_id, '_moondream_last_generated', time() );

		wp_send_json_success(
			array(
				'alt_text'  => $result['text'],
				'truncated' => $result['was_truncated'],
			)
		);
	}

	// -------------------------------------------------------------------------
	// Bulk generation
	// -------------------------------------------------------------------------

	/**
	 * Handle a bulk generation request (one image per call).
	 *
	 * Does NOT write alt text — JS stores results and writes via handle_save_alt_text
	 * after the user reviews them in the modal review phase.
	 */
	public function handle_generate_bulk() {
		check_ajax_referer( 'moondream_alt_text_nonce', 'nonce' );

		if ( ! current_user_can( 'upload_files' ) ) {
			wp_send_json_error(
				array( 'message' => __( 'You do not have permission to perform this action.', 'moondream-alt-text' ) ),
				403
			);
		}

		$attachment_id = absint( isset( $_POST['attachment_id'] ) ? $_POST['attachment_id'] : 0 );
		if ( ! $attachment_id ) {
			wp_send_json_error( array( 'message' => __( 'Invalid attachment ID.', 'moondream-alt-text' ) ) );
		}

		// Server-side overwrite enforcement (client also short-circuits, but server is authoritative).
		$overwrite = isset( $_POST['overwrite'] ) && sanitize_text_field( wp_unslash( $_POST['overwrite'] ) ) === 'true';
		if ( ! $overwrite ) {
			$existing = get_post_meta( $attachment_id, '_wp_attachment_image_alt', true );
			if ( ! empty( $existing ) ) {
				wp_send_json_success( array( 'skipped' => true ) );
			}
		}

		$result = $this->api->generate_alt_text_base64( $attachment_id );

		// Base64 path could not fetch the image server-side; signal JS to try the URL path.
		if ( is_wp_error( $result ) && $result->get_error_code() === 'image_not_accessible' ) {
			wp_send_json_success( array( 'needs_url_fallback' => true ) );
		}

		if ( is_wp_error( $result ) ) {
			wp_send_json_error( array( 'message' => $result->get_error_message() ) );
		}

		wp_send_json_success(
			array(
				'alt_text'  => $result['text'],
				'truncated' => $result['was_truncated'],
				'skipped'   => false,
			)
		);
	}

	// -------------------------------------------------------------------------
	// Bulk generation — base64 fallback leg
	// -------------------------------------------------------------------------

	/**
	 * Handle the URL fallback leg of a bulk generation request.
	 *
	 * Called by JS when handle_generate_bulk() signals needs_url_fallback.
	 * Sends the image URL directly to the API instead of fetching and encoding it.
	 */
	public function handle_generate_bulk_base64() {
		check_ajax_referer( 'moondream_alt_text_nonce', 'nonce' );

		if ( ! current_user_can( 'upload_files' ) ) {
			wp_send_json_error(
				array( 'message' => __( 'You do not have permission to perform this action.', 'moondream-alt-text' ) ),
				403
			);
		}

		$attachment_id = absint( isset( $_POST['attachment_id'] ) ? $_POST['attachment_id'] : 0 );
		if ( ! $attachment_id ) {
			wp_send_json_error( array( 'message' => __( 'Invalid attachment ID.', 'moondream-alt-text' ) ) );
		}

		$overwrite = isset( $_POST['overwrite'] ) && sanitize_text_field( wp_unslash( $_POST['overwrite'] ) ) === 'true';
		if ( ! $overwrite ) {
			$existing = get_post_meta( $attachment_id, '_wp_attachment_image_alt', true );
			if ( ! empty( $existing ) ) {
				wp_send_json_success( array( 'skipped' => true, 'via_base64' => true ) );
			}
		}

		$result = $this->api->generate_alt_text_url_only( $attachment_id );

		// URL also rejected by the API — no further fallback.
		if ( is_wp_error( $result ) && $result->get_error_code() === 'needs_base64' ) {
			wp_send_json_error( array( 'message' => __( 'The API could not process this image via either method.', 'moondream-alt-text' ) ) );
		}

		if ( is_wp_error( $result ) ) {
			wp_send_json_error( array( 'message' => $result->get_error_message() ) );
		}

		wp_send_json_success(
			array(
				'alt_text'  => $result['text'],
				'truncated' => $result['was_truncated'],
				'skipped'   => false,
			)
		);
	}

	// -------------------------------------------------------------------------
	// Save alt text (bulk review phase)
	// -------------------------------------------------------------------------

	/**
	 * Write a reviewed alt text value to post meta.
	 *
	 * Called after the user reviews bulk results and clicks "Save all".
	 */
	public function handle_save_alt_text() {
		check_ajax_referer( 'moondream_alt_text_nonce', 'nonce' );

		if ( ! current_user_can( 'upload_files' ) ) {
			wp_send_json_error(
				array( 'message' => __( 'You do not have permission to perform this action.', 'moondream-alt-text' ) ),
				403
			);
		}

		$attachment_id = absint( isset( $_POST['attachment_id'] ) ? $_POST['attachment_id'] : 0 );
		if ( ! $attachment_id || get_post_type( $attachment_id ) !== 'attachment' ) {
			wp_send_json_error( array( 'message' => __( 'Invalid attachment ID.', 'moondream-alt-text' ) ) );
		}

		$alt_text = sanitize_text_field( isset( $_POST['alt_text'] ) ? wp_unslash( $_POST['alt_text'] ) : '' );

		update_post_meta( $attachment_id, '_wp_attachment_image_alt', $alt_text );
		update_post_meta( $attachment_id, '_moondream_last_generated', time() );

		wp_send_json_success();
	}

	// -------------------------------------------------------------------------
	// Settings page API test
	// -------------------------------------------------------------------------

	/**
	 * Handle the settings page test button request.
	 *
	 * Requires manage_options (settings page context).
	 */
	public function handle_test_api() {
		check_ajax_referer( 'moondream_test_nonce', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error(
				array( 'message' => __( 'You do not have permission to perform this action.', 'moondream-alt-text' ) ),
				403
			);
		}

		$result = $this->api->test_with_url();

		if ( is_wp_error( $result ) ) {
			wp_send_json_error( array( 'message' => $result->get_error_message() ) );
		}

		wp_send_json_success(
			array(
				'text'          => $result['text'],
				'elapsed_ms'    => $result['elapsed_ms'],
				'method'        => $result['method'],
				'char_count'    => $result['char_count'],
				'was_truncated' => $result['was_truncated'],
			)
		);
	}

	// -------------------------------------------------------------------------
	// Grid view — no-alt filter
	// -------------------------------------------------------------------------

	/**
	 * Return IDs of all image attachments that have no alt text.
	 *
	 * Used by the JS grid filter: JS passes post__in with these IDs to constrain
	 * the media library grid query (post__in is in WordPress's query-attachments whitelist).
	 */
	public function handle_get_no_alt_ids() {
		check_ajax_referer( 'moondream_alt_text_nonce', 'nonce' );

		if ( ! current_user_can( 'upload_files' ) ) {
			wp_send_json_error(
				array( 'message' => __( 'You do not have permission to perform this action.', 'moondream-alt-text' ) ),
				403
			);
		}

		$args = array(
			'post_type'      => 'attachment',
			'post_mime_type' => Moondream_Api::get_supported_mime_types(),
			'post_status'    => 'inherit',
			'posts_per_page' => -1,
			'fields'         => 'ids',
			'meta_query'     => array(
				'relation' => 'OR',
				array(
					'key'     => '_wp_attachment_image_alt',
					'compare' => 'NOT EXISTS',
				),
				array(
					'key'     => '_wp_attachment_image_alt',
					'value'   => '',
					'compare' => '=',
				),
			),
		);

		// Optional: restrict to a specific set of IDs (used when pre-filtering a bulk selection).
		$raw_ids = isset( $_POST['post__in'] ) ? (array) $_POST['post__in'] : array();
		$post_in = array_values( array_filter( array_map( 'absint', $raw_ids ) ) );
		if ( ! empty( $post_in ) ) {
			$args['post__in'] = $post_in;
		}

		$query = new WP_Query( $args );
		wp_send_json_success( array( 'ids' => $query->posts ) );
	}
}
