<?php
/**
 * Removes all plugin data when the plugin is deleted.
 * Generated alt text (_wp_attachment_image_alt) is site content and is kept.
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

function moondream_uninstall_site() {
	delete_option( 'moondream_api_key' );
	delete_option( 'moondream_global_context' );
	delete_option( 'moondream_bulk_overwrite' );
	delete_option( 'moondream_truncation_notice' );

	delete_post_meta_by_key( '_moondream_last_generated' );

	// Cache left by the old hand-rolled updater.
	delete_transient( 'moondream_update_' . md5( WP_UNINSTALL_PLUGIN ) );
}

if ( is_multisite() ) {
	foreach ( get_sites( array( 'fields' => 'ids', 'number' => 0 ) ) as $moondream_site_id ) {
		switch_to_blog( $moondream_site_id );
		moondream_uninstall_site();
		restore_current_blog();
	}
} else {
	moondream_uninstall_site();
}

delete_site_option( 'external_updates-moondream-alt-text' );
wp_clear_scheduled_hook( 'puc_cron_check_updates-moondream-alt-text' );
