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

		add_action( 'wp_ajax_moondream_generate_single', array( $this, 'handle_generate_single' ) );
		add_action( 'wp_ajax_moondream_generate_bulk',   array( $this, 'handle_generate_bulk' ) );
		add_action( 'wp_ajax_moondream_save_alt_text',   array( $this, 'handle_save_alt_text' ) );
		add_action( 'wp_ajax_moondream_test_api',        array( $this, 'handle_test_api' ) );
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

		$result = $this->api->generate_alt_text( $attachment_id );

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

		wp_send_json_success( array( 'text' => $result['text'] ) );
	}
}
