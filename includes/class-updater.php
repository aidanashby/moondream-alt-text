<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Checks for plugin updates via GitHub Releases and integrates with the
 * WordPress update system so users see a standard "Update available" notice.
 *
 * The plugin zip attached to each GitHub release must have a top-level folder
 * named `moondream-alt-text` (matching the plugin slug). Build with:
 *   git archive --format=zip --prefix=moondream-alt-text/ HEAD -o moondream-alt-text.zip
 */
class Moondream_Updater {

	private $plugin_slug;
	private $plugin_dir_slug;
	private $github_user = 'aidanashby';
	private $github_repo = 'moondream-alt-text';
	private $transient_key;

	public function __construct( $plugin_file ) {
		$this->plugin_slug     = plugin_basename( $plugin_file );
		$this->plugin_dir_slug = dirname( $this->plugin_slug );
		$this->transient_key   = 'moondream_update_' . md5( $this->plugin_slug );

		add_filter( 'pre_set_site_transient_update_plugins', array( $this, 'check_for_update' ) );
		add_filter( 'plugins_api',                           array( $this, 'plugin_info' ), 20, 3 );
		add_action( 'upgrader_process_complete',             array( $this, 'purge_cache' ), 10, 2 );
	}

	// -------------------------------------------------------------------------
	// GitHub API
	// -------------------------------------------------------------------------

	/**
	 * Fetch the latest release from GitHub, cached for 12 hours.
	 *
	 * @return array|null Associative array with version, zip_url, description; or null on failure.
	 */
	private function get_latest_release() {
		$cached = get_transient( $this->transient_key );
		if ( $cached !== false ) {
			return $cached;
		}

		$api_url  = "https://api.github.com/repos/{$this->github_user}/{$this->github_repo}/releases/latest";
		$response = wp_remote_get(
			$api_url,
			array(
				'timeout' => 10,
				'headers' => array(
					'Accept'     => 'application/vnd.github.v3+json',
					'User-Agent' => 'WordPress/' . get_bloginfo( 'version' ) . '; ' . get_bloginfo( 'url' ),
				),
			)
		);

		if ( is_wp_error( $response ) || wp_remote_retrieve_response_code( $response ) !== 200 ) {
			return null;
		}

		$body = json_decode( wp_remote_retrieve_body( $response ), true );
		if ( ! is_array( $body ) || empty( $body['tag_name'] ) ) {
			return null;
		}

		// Prefer the explicitly uploaded zip asset over the auto-generated source archive.
		// The uploaded zip has the correct top-level folder name for WordPress to install from.
		$zip_url = '';
		if ( ! empty( $body['assets'] ) ) {
			foreach ( $body['assets'] as $asset ) {
				if ( isset( $asset['name'] ) && substr( $asset['name'], -4 ) === '.zip' ) {
					$zip_url = $asset['browser_download_url'];
					break;
				}
			}
		}
		if ( ! $zip_url && ! empty( $body['zipball_url'] ) ) {
			$zip_url = $body['zipball_url'];
		}

		if ( ! $zip_url ) {
			return null;
		}

		$release = array(
			'version'     => ltrim( $body['tag_name'], 'v' ),
			'zip_url'     => $zip_url,
			'description' => ! empty( $body['body'] ) ? $body['body'] : '',
			'published'   => ! empty( $body['published_at'] ) ? $body['published_at'] : '',
		);

		set_transient( $this->transient_key, $release, 12 * HOUR_IN_SECONDS );

		return $release;
	}

	// -------------------------------------------------------------------------
	// WordPress update hooks
	// -------------------------------------------------------------------------

	/**
	 * Inject update data into WordPress's plugin update transient when a newer
	 * version is available on GitHub.
	 *
	 * @param object $transient
	 * @return object
	 */
	public function check_for_update( $transient ) {
		if ( empty( $transient->checked ) ) {
			return $transient;
		}

		$release = $this->get_latest_release();
		if ( ! $release ) {
			return $transient;
		}

		if ( version_compare( MOONDREAM_VERSION, $release['version'], '<' ) ) {
			$transient->response[ $this->plugin_slug ] = (object) array(
				'slug'        => $this->plugin_dir_slug,
				'plugin'      => $this->plugin_slug,
				'new_version' => $release['version'],
				'url'         => "https://github.com/{$this->github_user}/{$this->github_repo}",
				'package'     => $release['zip_url'],
				'icons'       => array(),
				'banners'     => array(),
				'tested'      => '6.7',
				'requires_php' => '7.4',
			);
		}

		return $transient;
	}

	/**
	 * Provide plugin information for the "View version details" modal in wp-admin.
	 *
	 * @param false|object|array $result
	 * @param string             $action
	 * @param object             $args
	 * @return false|object
	 */
	public function plugin_info( $result, $action, $args ) {
		if ( $action !== 'plugin_information' ) {
			return $result;
		}
		if ( ! isset( $args->slug ) || $args->slug !== $this->plugin_dir_slug ) {
			return $result;
		}

		$release = $this->get_latest_release();
		if ( ! $release ) {
			return $result;
		}

		return (object) array(
			'name'          => 'Moondream Alt Text Generator',
			'slug'          => $this->plugin_dir_slug,
			'version'       => $release['version'],
			'author'        => '<a href="https://github.com/aidanashby">Aidan Ashby</a>',
			'homepage'      => "https://github.com/{$this->github_user}/{$this->github_repo}",
			'requires'      => '6.0',
			'tested'        => '6.7',
			'requires_php'  => '7.4',
			'download_link' => $release['zip_url'],
			'last_updated'  => $release['published'],
			'sections'      => array(
				'description' => '<p>Generates descriptive alt text for media library images using the Moondream Cloud vision API.</p>',
				'changelog'   => '<pre>' . esc_html( $release['description'] ) . '</pre>',
			),
		);
	}

	/**
	 * Clear the cached release data after an update completes.
	 *
	 * @param \WP_Upgrader $upgrader
	 * @param array        $options
	 */
	public function purge_cache( $upgrader, $options ) {
		if (
			isset( $options['action'], $options['type'] ) &&
			$options['action'] === 'update' &&
			$options['type'] === 'plugin' &&
			! empty( $options['plugins'] )
		) {
			foreach ( $options['plugins'] as $plugin ) {
				if ( $plugin === $this->plugin_slug ) {
					delete_transient( $this->transient_key );
				}
			}
		}
	}
}
