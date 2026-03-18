<?php
/**
 * Plugin Name: Moondream Alt Text Generator
 * Plugin URI:
 * Description: Generates descriptive alt text for media library images using the Moondream Cloud vision API.
 * Version: 1.0.0
 * Author: Aidan Ashby
 * Text Domain: moondream-alt-text
 * Domain Path: /languages
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * License: GPL-2.0-or-later
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'MOONDREAM_VERSION', '1.0.0' );
define( 'MOONDREAM_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'MOONDREAM_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'MOONDREAM_PLUGIN_FILE', __FILE__ );

// Maximum images processed per bulk run.
define( 'MOONDREAM_BULK_LIMIT', 20 );

// Soft character limit requested from API; hard cap applied server-side below.
define( 'MOONDREAM_PROMPT_CHAR_LIMIT', 100 );
define( 'MOONDREAM_HARD_CHAR_LIMIT', 125 );

// Maximum image file size sent to the API (5 MB).
define( 'MOONDREAM_MAX_FILE_SIZE', 5 * 1024 * 1024 );

// Moondream Cloud API endpoint.
define( 'MOONDREAM_API_ENDPOINT', 'https://api.moondream.ai/v1/query' );

/**
 * Load all plugin classes and boot the plugin.
 */
function moondream_run() {
	require_once MOONDREAM_PLUGIN_DIR . 'includes/class-api.php';
	require_once MOONDREAM_PLUGIN_DIR . 'includes/class-settings.php';
	require_once MOONDREAM_PLUGIN_DIR . 'includes/class-ajax.php';
	require_once MOONDREAM_PLUGIN_DIR . 'includes/class-core.php';

	Moondream_Core::get_instance();
}
add_action( 'plugins_loaded', 'moondream_run' );

/**
 * Activation: set default option values.
 */
function moondream_activate() {
	add_option( 'moondream_api_key', '' );
	add_option( 'moondream_global_context', '' );
	add_option( 'moondream_bulk_overwrite', false );
	add_option( 'moondream_truncation_notice', true );
}
register_activation_hook( __FILE__, 'moondream_activate' );

// Deactivation intentionally leaves options in place so the API key
// and settings are preserved if the plugin is re-activated.
