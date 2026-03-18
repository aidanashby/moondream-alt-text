/* global moondreamData, wp */
( function () {
	'use strict';

	var data = window.moondreamData || {};
	var strings = data.strings || {};

	// -------------------------------------------------------------------------
	// Shared: build the inject block (button + preview wrap)
	// -------------------------------------------------------------------------

	function buildInjectBlock() {
		var wrap = document.createElement( 'div' );
		wrap.className = 'moondream-inject-wrap';

		// Generate button
		var btn = document.createElement( 'button' );
		btn.type = 'button';
		btn.className = 'button moondream-generate-single';
		btn.textContent = strings.generate || 'Generate alt text';

		// Preview wrap (hidden until generation succeeds)
		var previewWrap = document.createElement( 'div' );
		previewWrap.className = 'moondream-preview-wrap';

		var previewTextarea = document.createElement( 'textarea' );
		previewTextarea.className = 'moondream-preview-text';
		previewTextarea.readOnly = true;
		previewTextarea.rows = 3;

		var acceptBtn = document.createElement( 'button' );
		acceptBtn.type = 'button';
		acceptBtn.className = 'button button-primary moondream-accept';
		acceptBtn.textContent = strings.accept || 'Accept';

		var truncationNotice = document.createElement( 'p' );
		truncationNotice.className = 'moondream-truncation-notice';
		truncationNotice.textContent = strings.truncated || 'Text was trimmed to fit the character limit.';

		var errorEl = document.createElement( 'p' );
		errorEl.className = 'moondream-error';

		previewWrap.appendChild( previewTextarea );
		previewWrap.appendChild( acceptBtn );
		previewWrap.appendChild( truncationNotice );

		// errorEl lives outside previewWrap so it's visible even before preview is shown.
		wrap.appendChild( btn );
		wrap.appendChild( errorEl );
		wrap.appendChild( previewWrap );

		return wrap;
	}

	// -------------------------------------------------------------------------
	// Shared: send generation request
	// -------------------------------------------------------------------------

	function sendGenerateRequest( attachmentId, btn, previewWrap, previewTextarea, truncationNotice, errorEl ) {
		btn.disabled = true;
		btn.textContent = strings.generating || 'Generating\u2026';
		errorEl.style.display = 'none';
		previewWrap.style.display = 'none';

		var formData = new FormData();
		formData.append( 'action', 'moondream_generate_single' );
		formData.append( 'nonce', data.nonce );
		formData.append( 'attachment_id', attachmentId );

		fetch( data.ajaxurl, { method: 'POST', body: formData } )
			.then( function ( r ) {
				if ( ! r.ok ) {
					throw new Error( 'network' );
				}
				return r.json();
			} )
			.then( function ( json ) {
				btn.disabled = false;
				btn.textContent = strings.generate || 'Generate alt text';

				if ( ! json.success ) {
					showError( errorEl, json.data && json.data.message ? json.data.message : strings.network_error );
					return;
				}

				previewTextarea.readOnly = true;
				previewTextarea.value = json.data.alt_text;
				truncationNotice.style.display =
					json.data.truncated && data.truncation_notice_enabled ? 'block' : 'none';
				previewWrap.style.display = 'block';
			} )
			.catch( function () {
				btn.disabled = false;
				btn.textContent = strings.generate || 'Generate alt text';
				showError( errorEl, strings.network_error );
			} );
	}

	function showError( errorEl, message ) {
		errorEl.textContent = message || strings.network_error;
		errorEl.style.display = 'block';
		errorEl.scrollIntoView( { block: 'nearest' } );
	}

	// -------------------------------------------------------------------------
	// Shared: bind the accept button
	// -------------------------------------------------------------------------

	function bindAcceptButton( block, previewTextarea, previewWrap, btn, altTextarea ) {
		var acceptBtn = block.querySelector( '.moondream-accept' );
		acceptBtn.addEventListener( 'click', function () {
			if ( altTextarea ) {
				altTextarea.value = previewTextarea.value;
				altTextarea.dispatchEvent( new Event( 'change', { bubbles: true } ) );
				altTextarea.dispatchEvent( new Event( 'input', { bubbles: true } ) );
			}
			previewWrap.style.display = 'none';
			btn.disabled = false;
		} );
	}

	// -------------------------------------------------------------------------
	// Modal context (grid view — attachment details panel)
	// -------------------------------------------------------------------------

	function injectIntoModal( detailsPanel ) {
		// Avoid double-injection.
		if ( detailsPanel.querySelector( '.moondream-inject-wrap' ) ) {
			return;
		}

		// Locate the alt text setting container via data-setting attribute.
		var altSetting = detailsPanel.querySelector( '.setting[data-setting="alt"]' );
		if ( ! altSetting ) {
			return;
		}

		var block = buildInjectBlock();
		var btn = block.querySelector( '.moondream-generate-single' );
		var previewWrap = block.querySelector( '.moondream-preview-wrap' );
		var previewTextarea = block.querySelector( '.moondream-preview-text' );
		var truncationNotice = block.querySelector( '.moondream-truncation-notice' );
		var errorEl = block.querySelector( '.moondream-error' );

		// Cache the ID at inject time while the DOM state is freshest.
		// The edit-attachment state (wp.media grid view) exposes the model via state().get('model').
		var cachedId = detailsPanel.getAttribute( 'data-id' ) || '';
		if ( ! cachedId ) {
			try {
				var injectModel = wp.media.frame.state().get( 'model' );
				if ( injectModel ) cachedId = String( injectModel.get( 'id' ) );
			} catch ( e ) {}
		}
		if ( ! cachedId ) {
			try {
				var injectSel = wp.media.frame.state().get( 'selection' );
				var injectFirst = ( injectSel.single && injectSel.single() ) || injectSel.first();
				if ( injectFirst ) cachedId = String( injectFirst.get( 'id' ) );
			} catch ( e ) {}
		}

		btn.addEventListener( 'click', function () {
			var attachmentId = '';

			// 0. Read from window.location.search — WordPress updates the URL to
			//    upload.php?item=ID when viewing a single attachment. This is always
			//    current at click time regardless of Backbone frame state.
			var itemParam = new URLSearchParams( window.location.search ).get( 'item' );
			if ( itemParam ) {
				attachmentId = itemParam;
			}

			// 1. wp.media Backbone state — try 'model' (edit-attachment state) then 'selection'.
			if ( ! attachmentId ) {
				try {
					var clickModel = wp.media.frame.state().get( 'model' );
					if ( clickModel ) attachmentId = String( clickModel.get( 'id' ) );
				} catch ( e ) {}
			}
			if ( ! attachmentId ) {
				try {
					var clickSel = wp.media.frame.state().get( 'selection' );
					var clickFirst = ( clickSel.single && clickSel.single() ) || clickSel.first();
					if ( clickFirst ) attachmentId = String( clickFirst.get( 'id' ) );
				} catch ( e ) {}
			}

			// 2. ID captured at inject time (fallback — may be stale if user switched images
			//    before the Backbone frame state updated).
			if ( ! attachmentId && cachedId ) {
				attachmentId = cachedId;
			}

			// 3. data-id on the details panel element itself (set by Backbone's attributes()).
			if ( ! attachmentId ) {
				attachmentId = detailsPanel.getAttribute( 'data-id' ) || '';
			}

			// 4. <li class="attachment details"> — single-image focus class.
			if ( ! attachmentId ) {
				var li = document.querySelector( '.attachment.details' );
				if ( li ) attachmentId = li.getAttribute( 'data-id' ) || '';
			}

			// 5. <li class="attachment selected"> — also used for single selection.
			if ( ! attachmentId ) {
				var li2 = document.querySelector( '.attachment.selected' );
				if ( li2 ) attachmentId = li2.getAttribute( 'data-id' ) || '';
			}

			// 6. Parse from the "Edit more details" link inside the panel.
			if ( ! attachmentId ) {
				var editLink = detailsPanel.querySelector( 'a.edit-attachment' ) ||
					document.querySelector( '.attachment-details a.edit-attachment, .media-sidebar a.edit-attachment' );
				if ( editLink ) {
					var m = ( editLink.getAttribute( 'href' ) || '' ).match( /[?&]post=(\d+)/ );
					if ( m ) attachmentId = m[ 1 ];
				}
			}

			if ( ! attachmentId ) {
				showError( errorEl, strings.no_attachment_id || 'Could not identify this attachment. Please refresh and try again.' );
				return;
			}

			// No client-side MIME check — server pre-flight handles format validation.
			sendGenerateRequest( attachmentId, btn, previewWrap, previewTextarea, truncationNotice, errorEl );
		} );

		bindAcceptButton( block, previewTextarea, previewWrap, btn, altSetting.querySelector( 'textarea' ) );

		// Inject after the .setting[data-setting="alt"] element.
		altSetting.parentNode.insertBefore( block, altSetting.nextSibling );
	}

	function initModalObserver() {
		var observer = new MutationObserver( function ( mutations ) {
			for ( var i = 0; i < mutations.length; i++ ) {
				var added = mutations[ i ].addedNodes;
				for ( var j = 0; j < added.length; j++ ) {
					var node = added[ j ];
					if ( node.nodeType !== 1 ) continue;
					if ( node.classList.contains( 'attachment-details' ) ) {
						injectIntoModal( node );
					} else {
						// Check descendants (sometimes the panel is nested).
						var panel = node.querySelector( '.attachment-details' );
						if ( panel ) {
							injectIntoModal( panel );
						}
					}
				}
			}
		} );

		observer.observe( document.body, { childList: true, subtree: true } );

		// Handle any panel already present on init.
		var existing = document.querySelector( '.attachment-details' );
		if ( existing ) {
			injectIntoModal( existing );
		}
	}

	// -------------------------------------------------------------------------
	// Edit media page (list view — /wp-admin/post.php?action=edit, attachment)
	// -------------------------------------------------------------------------

	function initEditPage() {
		// Supported MIME types (mirrors PHP whitelist). Only needed here — the modal
		// relies on server-side pre-flight instead.
		var SUPPORTED_MIME = [
			'image/jpeg', 'image/png', 'image/gif',
			'image/webp', 'image/avif', 'image/bmp', 'image/tiff',
		];

		// Confirm we are on an attachment edit screen.
		var altInput = document.querySelector( 'textarea[name="_wp_attachment_image_alt"]' );
		if ( ! altInput ) {
			return;
		}

		var params = new URLSearchParams( window.location.search );
		var attachmentId = params.get( 'post' );
		if ( ! attachmentId ) {
			return;
		}

		// Check MIME type — read from a hidden input WP outputs on this page.
		var mimeInput = document.querySelector( 'input[name="post_mime_type"]' );
		var mimeType = mimeInput ? mimeInput.value : '';

		var block = buildInjectBlock();
		var btn = block.querySelector( '.moondream-generate-single' );
		var previewWrap = block.querySelector( '.moondream-preview-wrap' );
		var previewTextarea = block.querySelector( '.moondream-preview-text' );
		var truncationNotice = block.querySelector( '.moondream-truncation-notice' );
		var errorEl = block.querySelector( '.moondream-error' );

		block.className += ' moondream-edit-page-wrap';

		if ( mimeType && SUPPORTED_MIME.indexOf( mimeType ) === -1 ) {
			btn.disabled = true;
			btn.title = strings.invalid_format || 'This image format is not supported.';
		} else {
			btn.addEventListener( 'click', function () {
				sendGenerateRequest( attachmentId, btn, previewWrap, previewTextarea, truncationNotice, errorEl );
			} );
		}

		bindAcceptButton( block, previewTextarea, previewWrap, btn, altInput );

		// Inject after the alt text textarea's nearest wrapper.
		altInput.parentNode.appendChild( block );
	}

	// -------------------------------------------------------------------------
	// Bootstrap
	// -------------------------------------------------------------------------

	document.addEventListener( 'DOMContentLoaded', function () {
		if ( document.body.classList.contains( 'upload-php' ) ) {
			// Media library grid view — watch for modal panels.
			initModalObserver();
		} else if ( document.body.classList.contains( 'post-type-attachment' ) ) {
			// Attachment edit page.
			initEditPage();
		}
	} );
} )();
