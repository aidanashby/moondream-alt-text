<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Core plugin class. Boots child classes, registers hooks, enqueues assets.
 */
class Moondream_Core {

	/**
	 * @var Moondream_Core|null
	 */
	private static $instance = null;

	/**
	 * @return Moondream_Core
	 */
	public static function get_instance() {
		if ( self::$instance === null ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	private function __construct() {
		// Load textdomain immediately — hooking to plugins_loaded from within a
		// plugins_loaded callback at the same priority would miss the action.
		load_plugin_textdomain(
			'moondream-alt-text',
			false,
			dirname( plugin_basename( MOONDREAM_PLUGIN_DIR . 'moondream-alt-text.php' ) ) . '/languages'
		);

		$api = new Moondream_Api();
		new Moondream_Settings();
		new Moondream_Ajax( $api );

		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
		add_action( 'pre_get_posts',         array( $this, 'filter_no_alt_list_view' ) );

		// Register PHP bulk action (for the dropdown option to appear).
		add_filter( 'bulk_actions-upload',        array( $this, 'register_bulk_action' ) );
		add_filter( 'handle_bulk_actions-upload', array( $this, 'handle_bulk_action_fallback' ), 10, 3 );
	}

	// -------------------------------------------------------------------------
	// Script / style enqueue
	// -------------------------------------------------------------------------

	public function enqueue_scripts( $hook ) {
		$is_upload_page     = $hook === 'upload.php';
		$screen             = get_current_screen();
		$is_attachment_edit = $hook === 'post.php' && $screen && $screen->post_type === 'attachment';

		if ( ! $is_upload_page && ! $is_attachment_edit ) {
			return;
		}

		if ( ! current_user_can( 'upload_files' ) ) {
			return;
		}

		wp_enqueue_style(
			'moondream-admin',
			MOONDREAM_PLUGIN_URL . 'assets/css/moondream-admin.css',
			array(),
			MOONDREAM_VERSION
		);

		$localize_data = array(
			'ajaxurl'                  => admin_url( 'admin-ajax.php' ),
			'nonce'                    => wp_create_nonce( 'moondream_alt_text_nonce' ),
			'bulk_limit'               => MOONDREAM_BULK_LIMIT,
			'truncation_notice_enabled' => (bool) get_option( 'moondream_truncation_notice', true ),
			'bulk_overwrite'           => (bool) get_option( 'moondream_bulk_overwrite', false ),
			'supported_mime_types'     => Moondream_Api::get_supported_mime_types(),
			'strings'                  => array(
				'generate'        => __( 'Generate alt text', 'moondream-alt-text' ),
				'generating'      => __( 'Generating…', 'moondream-alt-text' ),
				'accept'          => __( 'Accept', 'moondream-alt-text' ),
				'retry'           => __( 'Retry', 'moondream-alt-text' ),
				'truncated'       => __( 'Text was trimmed to fit the character limit.', 'moondream-alt-text' ),
				'bulk_limit_warn' => sprintf(
					/* translators: %d: bulk image limit */
					__( 'You can generate alt text for up to %d images at a time. The first %d compatible images will be processed.', 'moondream-alt-text' ),
					MOONDREAM_BULK_LIMIT,
					MOONDREAM_BULK_LIMIT
				),
				'no_api_key'      => __( 'No API key configured. Please visit Settings &rsaquo; Moondream Alt Text.', 'moondream-alt-text' ),
				'permission'      => __( 'You do not have permission to perform this action.', 'moondream-alt-text' ),
				'nonce_fail'      => __( 'Security check failed. Please refresh and try again.', 'moondream-alt-text' ),
				'network_error'   => __( 'Network error. Please check your connection and try again.', 'moondream-alt-text' ),
				'timeout'         => __( 'The request timed out. The image may be too large or the API unresponsive.', 'moondream-alt-text' ),
				'rate_limit'      => __( 'Rate limit reached. Please wait a moment and try again.', 'moondream-alt-text' ),
				'invalid_format'  => __( 'This file format is not supported.', 'moondream-alt-text' ),
				'image_too_large' => __( 'This image exceeds the maximum file size for the API.', 'moondream-alt-text' ),
				'empty_response'   => __( 'The API returned an empty response. Try again or check your prompt context.', 'moondream-alt-text' ),
				'no_attachment_id' => __( 'Could not identify this attachment. Please refresh and try again.', 'moondream-alt-text' ),
				'skipped'          => __( 'Skipped (has alt text)', 'moondream-alt-text' ),
				'close'            => __( 'Close', 'moondream-alt-text' ),
				'generating_bulk' => __( 'Generating alt text', 'moondream-alt-text' ),
				'of'              => __( 'of', 'moondream-alt-text' ),
				'complete'        => __( 'complete', 'moondream-alt-text' ),
				'succeeded'       => __( 'succeeded', 'moondream-alt-text' ),
				'failed'          => __( 'failed', 'moondream-alt-text' ),
				'review_header'   => __( 'Review generated alt text', 'moondream-alt-text' ),
				'save_all'        => __( 'Save all', 'moondream-alt-text' ),
				'discard'         => __( 'Discard', 'moondream-alt-text' ),
				'keep'            => __( 'Keep', 'moondream-alt-text' ),
				'filter_no_alt'    => __( 'Missing alt text', 'moondream-alt-text' ),
				'filter_show_all'  => __( 'Show all images', 'moondream-alt-text' ),
				'retrying'         => __( 'Retrying…', 'moondream-alt-text' ),
				'skipped_types'    => __( 'file(s) skipped — unsupported format:', 'moondream-alt-text' ),
				'all_incompatible' => __( 'No compatible images selected. Unsupported format:', 'moondream-alt-text' ),
				'all_have_alt'     => __( 'All selected images already have alt text.', 'moondream-alt-text' ),
				'generated'        => __( 'generated', 'moondream-alt-text' ),
				'skipped_summary'  => __( 'skipped', 'moondream-alt-text' ),
				'cancel'          => __( 'Cancel', 'moondream-alt-text' ),
				'cancelled'       => __( 'Cancelled', 'moondream-alt-text' ),
				'saving'          => __( 'Saving…', 'moondream-alt-text' ),
				'saved'           => __( 'Saved', 'moondream-alt-text' ),
			),
		);

		// Single-image JS: load on both upload page and attachment edit page.
		wp_enqueue_script(
			'moondream-media',
			MOONDREAM_PLUGIN_URL . 'assets/js/moondream-media.js',
			array(),
			MOONDREAM_VERSION,
			true
		);
		wp_localize_script( 'moondream-media', 'moondreamData', $localize_data );

		// Bulk JS: only needed on the upload page (media library).
		if ( $is_upload_page ) {
			wp_enqueue_script(
				'moondream-bulk',
				MOONDREAM_PLUGIN_URL . 'assets/js/moondream-bulk.js',
				array(),
				MOONDREAM_VERSION,
				true
			);
			wp_localize_script( 'moondream-bulk', 'moondreamData', $localize_data );

			wp_enqueue_script(
				'moondream-filter',
				MOONDREAM_PLUGIN_URL . 'assets/js/moondream-filter.js',
				array(),
				MOONDREAM_VERSION,
				true
			);
			wp_localize_script( 'moondream-filter', 'moondreamData', $localize_data );
		}
	}

	// -------------------------------------------------------------------------
	// List view — no-alt filter
	// -------------------------------------------------------------------------

	/**
	 * Filter the media library list view query to show only images without alt text.
	 *
	 * Hooked to pre_get_posts. Applies when upload.php is loaded with ?moondream_no_alt=1,
	 * set by the JS toggle button via a URL param and page reload.
	 *
	 * @param WP_Query $query
	 */
	public function filter_no_alt_list_view( $query ) {
		if ( ! is_admin() || ! $query->is_main_query() ) {
			return;
		}

		global $pagenow;
		if ( $pagenow !== 'upload.php' ) {
			return;
		}

		if ( empty( $_GET['moondream_no_alt'] ) ) {
			return;
		}

		$query->set( 'post_mime_type', Moondream_Api::get_supported_mime_types() );
		$query->set(
			'meta_query',
			array(
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
			)
		);
	}

	// -------------------------------------------------------------------------
	// Bulk action registration (list view)
	// -------------------------------------------------------------------------

	/**
	 * Add the plugin's action to the media list view bulk actions dropdown.
	 *
	 * @param array $actions
	 * @return array
	 */
	public function register_bulk_action( $actions ) {
		if ( current_user_can( 'upload_files' ) ) {
			$actions['moondream_generate_alt_text'] = __( 'Generate alt text', 'moondream-alt-text' );
		}
		return $actions;
	}

	/**
	 * PHP fallback for when the bulk action form is submitted without JS.
	 *
	 * The JS intercept handles the real work; this only runs if JS is disabled.
	 *
	 * @param string $redirect_to
	 * @param string $action
	 * @param int[]  $post_ids
	 * @return string
	 */
	public function handle_bulk_action_fallback( $redirect_to, $action, $post_ids ) {
		if ( $action !== 'moondream_generate_alt_text' ) {
			return $redirect_to;
		}

		// JS is required for bulk processing. Show an admin notice and redirect back.
		return add_query_arg( 'moondream_js_required', '1', $redirect_to );
	}
}
