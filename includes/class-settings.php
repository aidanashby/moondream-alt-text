<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers and renders the plugin settings page.
 */
class Moondream_Settings {

	public function __construct() {
		add_action( 'admin_menu', array( $this, 'add_settings_page' ) );
		add_action( 'admin_init', array( $this, 'register_settings' ) );
		add_filter( 'plugin_action_links_' . plugin_basename( MOONDREAM_PLUGIN_FILE ), array( $this, 'add_action_link' ) );
	}

	public function add_settings_page() {
		add_options_page(
			__( 'Moondream Alt Text', 'moondream-alt-text' ),
			__( 'Moondream Alt Text', 'moondream-alt-text' ),
			'manage_options',
			'moondream-alt-text',
			array( $this, 'render_settings_page' )
		);
	}

	public function register_settings() {
		register_setting(
			'moondream_settings',
			'moondream_api_key',
			array(
				'type'              => 'string',
				'sanitize_callback' => array( $this, 'sanitize_api_key' ),
				'default'           => '',
			)
		);

		register_setting(
			'moondream_settings',
			'moondream_global_context',
			array(
				'type'              => 'string',
				'sanitize_callback' => array( $this, 'sanitize_global_context' ),
				'default'           => '',
			)
		);

		register_setting(
			'moondream_settings',
			'moondream_bulk_overwrite',
			array(
				'type'              => 'boolean',
				'sanitize_callback' => 'rest_sanitize_boolean',
				'default'           => false,
			)
		);

		register_setting(
			'moondream_settings',
			'moondream_truncation_notice',
			array(
				'type'              => 'boolean',
				'sanitize_callback' => 'rest_sanitize_boolean',
				'default'           => true,
			)
		);

		// --- API Configuration section ---
		add_settings_section(
			'moondream_api_section',
			__( 'API Configuration', 'moondream-alt-text' ),
			'__return_false',
			'moondream-alt-text'
		);

		add_settings_field(
			'moondream_api_key',
			__( 'API Key', 'moondream-alt-text' ),
			array( $this, 'render_api_key_field' ),
			'moondream-alt-text',
			'moondream_api_section'
		);

		// --- Prompt Behaviour section ---
		add_settings_section(
			'moondream_prompt_section',
			__( 'Prompt Behaviour', 'moondream-alt-text' ),
			'__return_false',
			'moondream-alt-text'
		);

		add_settings_field(
			'moondream_global_context',
			__( 'Global context', 'moondream-alt-text' ),
			array( $this, 'render_global_context_field' ),
			'moondream-alt-text',
			'moondream_prompt_section'
		);

		add_settings_field(
			'moondream_truncation_notice',
			__( 'Truncation notice', 'moondream-alt-text' ),
			array( $this, 'render_truncation_notice_field' ),
			'moondream-alt-text',
			'moondream_prompt_section'
		);

		// --- Bulk Behaviour section ---
		add_settings_section(
			'moondream_bulk_section',
			__( 'Bulk Behaviour', 'moondream-alt-text' ),
			'__return_false',
			'moondream-alt-text'
		);

		add_settings_field(
			'moondream_bulk_overwrite',
			__( 'Existing alt text', 'moondream-alt-text' ),
			array( $this, 'render_bulk_overwrite_field' ),
			'moondream-alt-text',
			'moondream_bulk_section'
		);
	}

	// -------------------------------------------------------------------------
	// Field renderers
	// -------------------------------------------------------------------------

	public function render_api_key_field() {
		$value = get_option( 'moondream_api_key', '' );
		?>
		<input
			type="password"
			name="moondream_api_key"
			id="moondream_api_key"
			value="<?php echo esc_attr( $value ); ?>"
			class="regular-text"
			autocomplete="off"
		/>
		<p class="description">
			<?php esc_html_e( 'Your Moondream Cloud API key.', 'moondream-alt-text' ); ?>
		</p>
		<?php
	}

	public function render_global_context_field() {
		$value = get_option( 'moondream_global_context', '' );
		$max   = 500;
		$count = mb_strlen( $value );
		?>
		<textarea
			name="moondream_global_context"
			id="moondream_global_context"
			rows="4"
			cols="50"
			class="large-text"
			maxlength="<?php echo esc_attr( $max ); ?>"
		><?php echo esc_textarea( $value ); ?></textarea>
		<p class="description">
			<?php
			printf(
				/* translators: %d: maximum character count */
				esc_html__( 'Optional context appended to every prompt (e.g. "Images are from a food bank in Bristol, UK."). Maximum %d characters.', 'moondream-alt-text' ),
				$max
			);
			?>
		</p>
		<p class="moondream-char-count">
			<span id="moondream_context_count"><?php echo esc_html( $count ); ?></span> / <?php echo esc_html( $max ); ?>
		</p>
		<script>
		( function() {
			var textarea = document.getElementById( 'moondream_global_context' );
			var counter  = document.getElementById( 'moondream_context_count' );
			if ( textarea && counter ) {
				textarea.addEventListener( 'input', function() {
					counter.textContent = textarea.value.length;
				} );
			}
		} )();
		</script>
		<?php
	}

	public function render_truncation_notice_field() {
		$value = get_option( 'moondream_truncation_notice', true );
		?>
		<label>
			<input
				type="checkbox"
				name="moondream_truncation_notice"
				id="moondream_truncation_notice"
				value="1"
				<?php checked( $value, true ); ?>
			/>
			<?php esc_html_e( 'Show a notice in the UI when generated alt text was trimmed to fit the character limit.', 'moondream-alt-text' ); ?>
		</label>
		<?php
	}

	public function render_bulk_overwrite_field() {
		$value = get_option( 'moondream_bulk_overwrite', false );
		?>
		<fieldset>
			<label>
				<input
					type="radio"
					name="moondream_bulk_overwrite"
					value="0"
					<?php checked( $value, false ); ?>
				/>
				<?php esc_html_e( 'Skip images that already have alt text', 'moondream-alt-text' ); ?>
			</label>
			<br />
			<label>
				<input
					type="radio"
					name="moondream_bulk_overwrite"
					value="1"
					<?php checked( $value, true ); ?>
				/>
				<?php esc_html_e( 'Overwrite existing alt text', 'moondream-alt-text' ); ?>
			</label>
		</fieldset>
		<?php
	}

	// -------------------------------------------------------------------------
	// Settings page
	// -------------------------------------------------------------------------

	public function render_settings_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Moondream Alt Text', 'moondream-alt-text' ); ?></h1>

			<form method="post" action="options.php">
				<?php
				settings_fields( 'moondream_settings' );
				do_settings_sections( 'moondream-alt-text' );
				submit_button();
				?>
			</form>

			<hr />

			<h2><?php esc_html_e( 'Test API connection', 'moondream-alt-text' ); ?></h2>
			<p><?php esc_html_e( 'Sends a test image to the API using your current settings and displays the raw response.', 'moondream-alt-text' ); ?></p>
			<button type="button" id="moondream-test-btn" class="button">
				<?php esc_html_e( 'Test connection', 'moondream-alt-text' ); ?>
			</button>
			<div id="moondream-test-result" style="margin-top:1em; display:none;">
				<pre id="moondream-test-output" style="background:#f6f7f7;padding:1em;border:1px solid #dcdcde;border-bottom:none;overflow:auto;max-height:200px;margin-bottom:0;"></pre>
				<div id="moondream-test-stats" class="moondream-test-stats"></div>
			</div>

			<script>
			( function() {
				var btn    = document.getElementById( 'moondream-test-btn' );
				var result = document.getElementById( 'moondream-test-result' );
				var output = document.getElementById( 'moondream-test-output' );
				var stats  = document.getElementById( 'moondream-test-stats' );

				if ( ! btn ) return;

				btn.addEventListener( 'click', function() {
					btn.disabled         = true;
					btn.textContent      = <?php echo wp_json_encode( __( 'Testing…', 'moondream-alt-text' ) ); ?>;
					result.style.display = 'none';
					if ( stats ) { stats.innerHTML = ''; }

					var formData = new FormData();
					formData.append( 'action', 'moondream_test_api' );
					formData.append( 'nonce', <?php echo wp_json_encode( wp_create_nonce( 'moondream_test_nonce' ) ); ?> );

					fetch( <?php echo wp_json_encode( admin_url( 'admin-ajax.php' ) ); ?>, {
						method: 'POST',
						body: formData,
					} )
					.then( function( r ) { return r.json(); } )
					.then( function( json ) {
						if ( json.success ) {
							output.textContent = json.data.text;
							if ( stats ) {
								stats.innerHTML =
									'<table>' +
									'<tr><th>' + <?php echo wp_json_encode( __( 'Method', 'moondream-alt-text' ) ); ?> + '</th><td>' + ( json.data.method === 'base64' ? 'Base64' : 'URL' ) + '</td></tr>' +
									'<tr><th>' + <?php echo wp_json_encode( __( 'Response time', 'moondream-alt-text' ) ); ?> + '</th><td>' + json.data.elapsed_ms + 'ms</td></tr>' +
									'<tr><th>' + <?php echo wp_json_encode( __( 'Characters', 'moondream-alt-text' ) ); ?> + '</th><td>' + json.data.char_count + ( json.data.was_truncated ? ' ' + <?php echo wp_json_encode( __( '(truncated)', 'moondream-alt-text' ) ); ?> : '' ) + '</td></tr>' +
									'</table>';
							}
						} else {
							output.textContent = json.data && json.data.message ? json.data.message : <?php echo wp_json_encode( __( 'Unknown error.', 'moondream-alt-text' ) ); ?>;
							if ( stats ) { stats.innerHTML = ''; }
						}
						result.style.display = 'block';
						btn.disabled         = false;
						btn.textContent      = <?php echo wp_json_encode( __( 'Test connection', 'moondream-alt-text' ) ); ?>;
					} )
					.catch( function() {
						output.textContent   = <?php echo wp_json_encode( __( 'Network error. Please check your connection and try again.', 'moondream-alt-text' ) ); ?>;
						if ( stats ) { stats.innerHTML = ''; }
						result.style.display = 'block';
						btn.disabled         = false;
						btn.textContent      = <?php echo wp_json_encode( __( 'Test connection', 'moondream-alt-text' ) ); ?>;
					} );
				} );
			} )();
			</script>
		</div>
		<?php
	}

	// -------------------------------------------------------------------------
	// Sanitize callbacks
	// -------------------------------------------------------------------------

	public function sanitize_api_key( $value ) {
		return trim( sanitize_text_field( $value ) );
	}

	public function sanitize_global_context( $value ) {
		$value = sanitize_textarea_field( $value );
		if ( mb_strlen( $value ) > 500 ) {
			$value = mb_substr( $value, 0, 500 );
		}
		return $value;
	}

	// -------------------------------------------------------------------------
	// Plugin action link
	// -------------------------------------------------------------------------

	public function add_action_link( $links ) {
		$settings_link = '<a href="' . esc_url( admin_url( 'options-general.php?page=moondream-alt-text' ) ) . '">' .
			esc_html__( 'Settings', 'moondream-alt-text' ) . '</a>';
		array_unshift( $links, $settings_link );
		return $links;
	}
}
