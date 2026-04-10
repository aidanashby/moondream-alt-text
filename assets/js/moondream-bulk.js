/* global moondreamData, wp */
( function () {
	'use strict';

	var data      = window.moondreamData || {};
	var strings   = data.strings || {};
	var bulkLimit = data.bulk_limit || 20;

	// -------------------------------------------------------------------------
	// MIME type support structures
	// Derived from PHP-localised supported_mime_types so every layer uses the
	// same authoritative list from class-api.php.
	// -------------------------------------------------------------------------

	var supportedMimeTypes = data.supported_mime_types || [];

	// Raw subtypes for grid view data-subtype matching: 'svg+xml', 'jpeg', etc.
	var supportedSubtypes = supportedMimeTypes.map( function ( m ) {
		return m.split( '/' )[ 1 ];
	} );

	// Sanitized subtypes for list view CSS class matching.
	// Mirrors WordPress sanitize_html_class(): strips non-[A-Za-z0-9_-] chars.
	var supportedSubtypesSanitized = supportedSubtypes.map( function ( s ) {
		return s.replace( /[^A-Za-z0-9_-]/g, '' );
	} );

	// Label map: both raw and sanitized forms map to a human-readable label.
	// 'svg+xml' → 'SVG',  'svgxml' → 'SVG',  'jpeg' → 'JPEG'
	var subtypeLabels = {};
	supportedMimeTypes.forEach( function ( mime ) {
		var raw       = mime.split( '/' )[ 1 ];
		var sanitized = raw.replace( /[^A-Za-z0-9_-]/g, '' );
		var label     = raw.split( '+' )[ 0 ].toUpperCase();
		subtypeLabels[ raw ]       = label;
		subtypeLabels[ sanitized ] = label;
	} );

	function subtypeLabel( subtype ) {
		return subtypeLabels[ subtype ] || subtype.split( '+' )[ 0 ].toUpperCase();
	}

	// -------------------------------------------------------------------------
	// Modal
	// -------------------------------------------------------------------------

	var modal     = null;
	var overlayEl = null;

	function createModal( items ) {
		overlayEl = document.createElement( 'div' );
		overlayEl.className = 'moondream-modal-overlay';

		var modalEl = document.createElement( 'div' );
		modalEl.className = 'moondream-modal';
		modalEl.setAttribute( 'role', 'dialog' );
		modalEl.setAttribute( 'aria-modal', 'true' );
		modalEl.setAttribute( 'aria-label', strings.generating_bulk || 'Generating alt text' );

		// Header
		var header = document.createElement( 'div' );
		header.className = 'moondream-modal__header';

		var title = document.createElement( 'h2' );
		title.className = 'moondream-modal__title';
		title.textContent = strings.generating_bulk || 'Generating alt text';

		var counter = document.createElement( 'p' );
		counter.className = 'moondream-modal__counter';
		counter.textContent = '0 ' + ( strings.of || 'of' ) + ' ' + items.length + ' ' + ( strings.complete || 'complete' );

		var progressBar = document.createElement( 'div' );
		progressBar.className = 'moondream-progress-bar';
		var progressFill = document.createElement( 'div' );
		progressFill.className = 'moondream-progress-bar__fill';
		progressBar.appendChild( progressFill );

		header.appendChild( title );
		header.appendChild( counter );
		header.appendChild( progressBar );

		// Limit warning (shown if selection was capped at bulkLimit)
		var limitWarn = document.createElement( 'div' );
		limitWarn.className = 'moondream-modal__limit-warn';
		limitWarn.textContent = strings.bulk_limit_warn || '';

		// Skipped-types notice (shown if incompatible files were excluded)
		var skippedWarn = document.createElement( 'div' );
		skippedWarn.className = 'moondream-modal__skipped-warn';

		// Image list
		var list = document.createElement( 'ul' );
		list.className = 'moondream-modal__list';

		var rows = [];
		items.forEach( function ( item ) {
			var row = buildRow( item );
			list.appendChild( row.el );
			rows.push( row );
		} );

		// Footer
		var footer = document.createElement( 'div' );
		footer.className = 'moondream-modal__footer';

		var cancelBtn = document.createElement( 'button' );
		cancelBtn.type = 'button';
		cancelBtn.className = 'button';
		cancelBtn.textContent = strings.cancel || 'Cancel';
		cancelBtn.addEventListener( 'click', function () {
			if ( modal ) {
				modal.cancelled = true;
				cancelBtn.disabled = true;
			}
		} );
		footer.appendChild( cancelBtn );

		var closeBtn = document.createElement( 'button' );
		closeBtn.type = 'button';
		closeBtn.className = 'button';
		closeBtn.textContent = strings.close || 'Close';
		closeBtn.disabled = true;
		closeBtn.addEventListener( 'click', destroyModal );
		footer.appendChild( closeBtn );

		modalEl.appendChild( header );
		modalEl.appendChild( limitWarn );
		modalEl.appendChild( skippedWarn );
		modalEl.appendChild( list );
		modalEl.appendChild( footer );
		overlayEl.appendChild( modalEl );
		document.body.appendChild( overlayEl );

		modal = {
			title:        title,
			counter:      counter,
			progressFill: progressFill,
			progressBar:  progressBar,
			limitWarn:    limitWarn,
			skippedWarn:  skippedWarn,
			rows:         rows,
			closeBtn:     closeBtn,
			footer:       footer,
			total:        items.length,
			done:         0,
			succeeded:    0,
			skipped:      0,
			failed:       0,
			cancelled:    false,
			cancelBtn:    cancelBtn,
		};

		return modal;
	}

	function buildRow( item ) {
		var el = document.createElement( 'li' );
		el.className = 'moondream-modal__row';

		var thumb = document.createElement( 'img' );
		thumb.className = 'moondream-modal__thumb';
		thumb.width  = 50;
		thumb.height = 50;
		thumb.alt    = '';
		if ( item.thumb ) {
			thumb.src = item.thumb;
		} else {
			thumb.style.display = 'none';
		}

		var filename = document.createElement( 'span' );
		filename.className = 'moondream-modal__filename';
		filename.textContent = item.filename || ( '#' + item.id );

		var status = document.createElement( 'span' );
		status.className = 'moondream-modal__status';

		var spinner = document.createElement( 'span' );
		spinner.className = 'spinner';
		status.appendChild( spinner );

		el.appendChild( thumb );
		el.appendChild( filename );
		el.appendChild( status );

		return { el: el, status: status, id: item.id, generatedText: null, discarded: false, reviewInput: null };
	}

	function markRowGenerated( row ) {
		row.status.innerHTML = '<span class="moondream-modal__status--success">&#10003;</span>';
	}

	function markRowSkipped( row ) {
		row.status.innerHTML = '<span class="moondream-modal__status--skipped">' + escHtml( strings.skipped || 'Skipped' ) + '</span>';
	}

	function markRowRetrying( row ) {
		row.status.innerHTML = '<span class="moondream-modal__status--retrying">' + escHtml( strings.retrying || 'Retrying\u2026' ) + '</span>';
	}

	function markRowError( row, message ) {
		var errorSpan = document.createElement( 'span' );
		errorSpan.className = 'moondream-modal__status--error';
		errorSpan.textContent = message;

		var retryBtn = document.createElement( 'button' );
		retryBtn.type      = 'button';
		retryBtn.className = 'moondream-retry-single';
		retryBtn.textContent = strings.retry || 'Retry';

		retryBtn.addEventListener( 'click', function () {
			retryBtn.disabled = true;
			row.status.innerHTML = '';
			var spinner = document.createElement( 'span' );
			spinner.className = 'spinner';
			row.status.appendChild( spinner );

			modal.failed = Math.max( 0, modal.failed - 1 );
			modal.done   = Math.max( 0, modal.done - 1 );

			processOne( row ).then( updateProgress );
		} );

		row.status.innerHTML = '';
		row.status.appendChild( errorSpan );
		row.status.appendChild( retryBtn );
	}

	function updateProgress() {
		var pct = modal.total > 0 ? ( modal.done / modal.total ) * 100 : 0;
		modal.progressFill.style.width = pct + '%';
		modal.counter.textContent =
			modal.done + ' ' + ( strings.of || 'of' ) + ' ' + modal.total + ' ' + ( strings.complete || 'complete' );

		if ( modal.done >= modal.total ) {
			enterReviewPhase();
		}
	}

	// -------------------------------------------------------------------------
	// Review phase
	// -------------------------------------------------------------------------

	function enterReviewPhase() {
		if ( modal.cancelBtn ) {
			modal.cancelBtn.style.display = 'none';
		}

		modal.title.textContent = strings.review_header || 'Review generated alt text';
		var parts = [ modal.succeeded + ' ' + ( strings.generated || 'generated' ) ];
		if ( modal.skipped > 0 ) {
			parts.push( modal.skipped + ' ' + ( strings.skipped_summary || 'skipped' ) );
		}
		if ( modal.failed > 0 ) {
			parts.push( modal.failed + ' ' + ( strings.failed || 'failed' ) );
		}
		modal.counter.textContent = parts.join( ', ' );

		modal.progressBar.style.display = 'none';

		modal.rows.forEach( function ( row ) {
			if ( ! row.generatedText ) {
				return;
			}

			var input = document.createElement( 'input' );
			input.type      = 'text';
			input.className = 'moondream-modal__review-input';
			input.value     = row.generatedText;
			row.reviewInput = input;

			var discardBtn = document.createElement( 'button' );
			discardBtn.type      = 'button';
			discardBtn.className = 'moondream-retry-single';
			discardBtn.textContent = strings.discard || 'Discard';

			discardBtn.addEventListener( 'click', function () {
				row.discarded = ! row.discarded;
				if ( row.discarded ) {
					row.el.classList.add( 'moondream-modal__row--discarded' );
					discardBtn.textContent = strings.keep || 'Keep';
				} else {
					row.el.classList.remove( 'moondream-modal__row--discarded' );
					discardBtn.textContent = strings.discard || 'Discard';
				}
			} );

			row.status.innerHTML = '';
			row.status.appendChild( input );
			row.status.appendChild( discardBtn );
		} );

		var saveAllBtn = document.createElement( 'button' );
		saveAllBtn.type      = 'button';
		saveAllBtn.className = 'button button-primary';
		saveAllBtn.textContent = strings.save_all || 'Save all';
		saveAllBtn.addEventListener( 'click', function () {
			saveAllBtn.disabled = true;
			saveAll( saveAllBtn );
		} );
		modal.footer.insertBefore( saveAllBtn, modal.closeBtn );
		modal.saveAllBtn = saveAllBtn;

		modal.closeBtn.disabled = false;
	}

	function saveAll( saveAllBtn ) {
		var toSave = modal.rows.filter( function ( row ) {
			return row.generatedText && ! row.discarded;
		} );

		if ( ! toSave.length ) {
			saveAllBtn.textContent = strings.saved || 'Saved';
			return;
		}

		var promises = toSave.map( function ( row ) {
			row.status.innerHTML = '<span class="moondream-modal__status--saving">' + escHtml( strings.saving || 'Saving\u2026' ) + '</span>';

			var altText = row.reviewInput ? row.reviewInput.value : row.generatedText;

			var formData = new FormData();
			formData.append( 'action',        'moondream_save_alt_text' );
			formData.append( 'nonce',         data.nonce );
			formData.append( 'attachment_id', row.id );
			formData.append( 'alt_text',      altText );

			return fetch( data.ajaxurl, { method: 'POST', body: formData } )
				.then( function ( r ) { return r.json(); } )
				.then( function ( json ) {
					if ( json.success ) {
						row.status.innerHTML = '<span class="moondream-modal__status--success">' + escHtml( strings.saved || 'Saved' ) + '</span>';
					} else {
						var msg = json.data && json.data.message ? json.data.message : ( strings.network_error || 'Error' );
						row.status.innerHTML = '<span class="moondream-modal__status--error">' + escHtml( msg ) + '</span>';
					}
				} )
				.catch( function () {
					row.status.innerHTML = '<span class="moondream-modal__status--error">' + escHtml( strings.network_error || 'Network error' ) + '</span>';
				} );
		} );

		Promise.all( promises ).then( function () {
			saveAllBtn.textContent = strings.saved || 'Saved';
		} );
	}

	function destroyModal() {
		if ( overlayEl && overlayEl.parentNode ) {
			overlayEl.parentNode.removeChild( overlayEl );
		}
		modal     = null;
		overlayEl = null;
	}

	// -------------------------------------------------------------------------
	// AJAX — generate one image (base64 primary path)
	// -------------------------------------------------------------------------

	function processOne( row ) {
		var formData = new FormData();
		formData.append( 'action',        'moondream_generate_bulk' );
		formData.append( 'nonce',         data.nonce );
		formData.append( 'attachment_id', row.id );
		// Explicit string — wp_localize_script may serialise booleans as 1/""
		// on older WP versions; the PHP handler expects the literal string 'true'.
		formData.append( 'overwrite', data.bulk_overwrite ? 'true' : 'false' );

		return fetch( data.ajaxurl, { method: 'POST', body: formData } )
			.then( function ( r ) {
				if ( ! r.ok ) throw new Error( 'network' );
				return r.json();
			} )
			.then( function ( json ) {
				if ( ! modal ) return;

				// Base64 path could not fetch the image server-side; retry via URL.
				if ( json.success && json.data && json.data.needs_url_fallback ) {
					markRowRetrying( row );
					return processOneUrlFallback( row );
				}

				modal.done++;
				if ( json.success ) {
					if ( json.data && json.data.skipped ) {
						markRowSkipped( row );
						modal.skipped++;
					} else {
						row.generatedText = json.data.alt_text;
						markRowGenerated( row );
						modal.succeeded++;
					}
				} else {
					var msg = json.data && json.data.message ? json.data.message : ( strings.network_error || 'Error' );
					markRowError( row, msg );
					modal.failed++;
				}
			} )
			.catch( function () {
				if ( ! modal ) return;
				modal.done++;
				markRowError( row, strings.network_error || 'Network error.' );
				modal.failed++;
			} );
	}

	// -------------------------------------------------------------------------
	// AJAX — generate one image (URL fallback path)
	// -------------------------------------------------------------------------

	function processOneUrlFallback( row ) {
		var formData = new FormData();
		formData.append( 'action',        'moondream_generate_bulk_base64' );
		formData.append( 'nonce',         data.nonce );
		formData.append( 'attachment_id', row.id );
		formData.append( 'overwrite',     data.bulk_overwrite ? 'true' : 'false' );

		return fetch( data.ajaxurl, { method: 'POST', body: formData } )
			.then( function ( r ) {
				if ( ! r.ok ) throw new Error( 'network' );
				return r.json();
			} )
			.then( function ( json ) {
				if ( ! modal ) return;
				modal.done++;
				if ( json.success ) {
					if ( json.data && json.data.skipped ) {
						markRowSkipped( row );
						modal.skipped++;
					} else {
						row.generatedText = json.data.alt_text;
						markRowGenerated( row );
						modal.succeeded++;
					}
				} else {
					var msg = json.data && json.data.message ? json.data.message : ( strings.network_error || 'Error' );
					markRowError( row, msg );
					modal.failed++;
				}
			} )
			.catch( function () {
				if ( ! modal ) return;
				modal.done++;
				markRowError( row, strings.network_error || 'Network error.' );
				modal.failed++;
			} );
	}

	async function processSequentially( rows ) {
		for ( var i = 0; i < rows.length; i++ ) {
			if ( modal && modal.cancelled ) {
				// Mark all remaining rows as cancelled and account for them in the total.
				for ( var j = i; j < rows.length; j++ ) {
					rows[ j ].status.innerHTML =
						'<span class="moondream-modal__status--skipped">' +
						escHtml( strings.cancelled || 'Cancelled' ) + '</span>';
					modal.done++;
					modal.skipped++;
				}
				updateProgress();
				return;
			}
			await processOne( rows[ i ] );
			updateProgress();
		}
	}

	// -------------------------------------------------------------------------
	// Open bulk modal
	// -------------------------------------------------------------------------

	function openBulkModal( items, wasLimited, skippedCount, skippedLabels ) {
		if ( modal ) {
			return;
		}

		var m = createModal( items );

		if ( wasLimited ) {
			m.limitWarn.classList.add( 'is-visible' );
		}

		if ( skippedCount > 0 && skippedLabels.length ) {
			m.skippedWarn.textContent =
				skippedCount + ' ' +
				( strings.skipped_types || 'file(s) skipped \u2014 unsupported format:' ) +
				' ' + skippedLabels.join( ', ' );
			m.skippedWarn.classList.add( 'is-visible' );
		}

		processSequentially( m.rows );
	}

	// -------------------------------------------------------------------------
	// Inline notices
	// -------------------------------------------------------------------------

	function showNotice( anchorEl, message ) {
		var noticeId = 'moondream-incompatible-notice';
		var existing = document.getElementById( noticeId );
		if ( existing ) {
			existing.parentNode.removeChild( existing );
		}

		var notice = document.createElement( 'p' );
		notice.id            = noticeId;
		notice.style.cssText = 'margin:8px 0 0;font-size:13px;color:#646970;';
		notice.textContent   = message;

		anchorEl.insertAdjacentElement( 'afterend', notice );

		setTimeout( function () {
			if ( notice.parentNode ) {
				notice.parentNode.removeChild( notice );
			}
		}, 4000 );
	}

	function showIncompatibleNotice( anchorEl, skippedLabels ) {
		showNotice(
			anchorEl,
			( strings.all_incompatible || 'No compatible images selected. Unsupported format:' ) +
			' ' + skippedLabels.join( ', ' )
		);
	}

	// -------------------------------------------------------------------------
	// Pre-filter by no-alt status, apply limit, open modal
	// -------------------------------------------------------------------------

	function prepareAndOpen( items, skippedCount, skippedLabels, anchorEl ) {
		// When overwrite is on, all compatible images are fair game — no pre-filter needed.
		if ( data.bulk_overwrite ) {
			var wasLimited = items.length > bulkLimit;
			if ( wasLimited ) {
				items = items.slice( 0, bulkLimit );
			}
			openBulkModal( items, wasLimited, skippedCount, skippedLabels );
			return;
		}

		// Ask the server which of the selected IDs are missing alt text, then
		// apply the bulk limit to that filtered list so no slots are wasted on
		// images that would be skipped anyway.
		var formData = new FormData();
		formData.append( 'action', 'moondream_get_no_alt_ids' );
		formData.append( 'nonce', data.nonce );
		items.forEach( function ( item ) {
			formData.append( 'post__in[]', item.id );
		} );

		fetch( data.ajaxurl, { method: 'POST', body: formData } )
			.then( function ( r ) { return r.json(); } )
			.then( function ( json ) {
				var noAltIds = json.success && json.data ? json.data.ids : null;
				var filtered = noAltIds
					? items.filter( function ( item ) {
						return noAltIds.indexOf( item.id ) !== -1;
					} )
					: items;

				if ( ! filtered.length ) {
					showNotice( anchorEl, strings.all_have_alt || 'All selected images already have alt text.' );
					return;
				}

				var wasLimited = filtered.length > bulkLimit;
				if ( wasLimited ) {
					filtered = filtered.slice( 0, bulkLimit );
				}
				openBulkModal( filtered, wasLimited, skippedCount, skippedLabels );
			} )
			.catch( function () {
				// Fallback: open without pre-filtering rather than silently failing.
				var wasLimited = items.length > bulkLimit;
				if ( wasLimited ) {
					items = items.slice( 0, bulkLimit );
				}
				openBulkModal( items, wasLimited, skippedCount, skippedLabels );
			} );
	}

	// -------------------------------------------------------------------------
	// Collect attachment data — grid view
	// -------------------------------------------------------------------------

	function getGridSelectionItems() {
		var items        = [];
		var skippedCount = 0;
		var skippedTypes = {};

		// Backbone selection is the authoritative source — it carries the full
		// MIME type for every attachment, which is more reliable than parsing CSS
		// classes (subtypes like svg+xml do not survive class sanitisation cleanly).
		try {
			var selection = wp.media.frame.state().get( 'selection' );
			if ( selection && selection.models.length ) {
				selection.models.forEach( function ( m ) {
					var mime    = m.get( 'mime' ) || '';
					var subtype = mime.split( '/' )[ 1 ] || m.get( 'subtype' ) || '';
					if ( ! mime || supportedMimeTypes.indexOf( mime ) === -1 ) {
						skippedCount++;
						if ( subtype ) skippedTypes[ subtype ] = true;
						return;
					}
					var sizes = m.get( 'sizes' );
					var thumb = sizes && sizes.thumbnail ? sizes.thumbnail.url : ( m.get( 'url' ) || '' );
					items.push( {
						id:       m.get( 'id' ),
						filename: m.get( 'filename' ) || m.get( 'title' ) || ( '#' + m.get( 'id' ) ),
						thumb:    thumb,
					} );
				} );
				return {
					items:         items,
					skippedCount:  skippedCount,
					skippedLabels: Object.keys( skippedTypes ).map( subtypeLabel ),
				};
			}
		} catch ( e ) {}

		// DOM fallback when Backbone is unavailable.
		var selectedLis = document.querySelectorAll( '.attachments-browser .attachment.selected' );
		selectedLis.forEach( function ( li ) {
			var id = parseInt( li.getAttribute( 'data-id' ), 10 );
			if ( ! id ) return;

			var classMatch = li.className.match( /\bsubtype-([A-Za-z0-9_-]+)\b/ );
			var subtype    = classMatch ? classMatch[ 1 ] : '';
			if ( subtype && supportedSubtypesSanitized.indexOf( subtype ) === -1 ) {
				skippedCount++;
				skippedTypes[ subtype ] = true;
				return;
			}

			var thumbEl    = li.querySelector( 'img' );
			var filenameEl = li.querySelector( '.filename strong' );
			items.push( {
				id:       id,
				filename: filenameEl
					? filenameEl.textContent.trim()
					: ( li.getAttribute( 'aria-label' ) || ( '#' + id ) ),
				thumb: thumbEl ? thumbEl.src : '',
			} );
		} );

		return {
			items:         items,
			skippedCount:  skippedCount,
			skippedLabels: Object.keys( skippedTypes ).map( subtypeLabel ),
		};
	}

	// -------------------------------------------------------------------------
	// Grid view: inject button into .media-toolbar-secondary
	// -------------------------------------------------------------------------

	function injectGridBulkButton( toolbar ) {
		if ( toolbar.querySelector( '.moondream-generate-bulk' ) ) {
			return;
		}

		var secondary = toolbar.querySelector( '.media-toolbar-secondary' );
		if ( ! secondary ) {
			return;
		}

		var btn = document.createElement( 'button' );
		btn.type      = 'button';
		btn.className = 'button media-button button-large moondream-generate-bulk';
		btn.textContent = strings.generate || 'Generate alt text';

		btn.addEventListener( 'click', function () {
			var result        = getGridSelectionItems();
			var items         = result.items;
			var skippedCount  = result.skippedCount;
			var skippedLabels = result.skippedLabels;

			if ( ! items.length ) {
				if ( skippedCount > 0 ) {
					showIncompatibleNotice( btn, skippedLabels );
				}
				return;
			}

			prepareAndOpen( items, skippedCount, skippedLabels, btn );
		} );

		secondary.appendChild( btn );
	}

	function removeGridBulkButton( toolbar ) {
		var btn = toolbar.querySelector( '.moondream-generate-bulk' );
		if ( btn ) {
			btn.parentNode.removeChild( btn );
		}
	}

	/**
	 * Set up a class-change observer on the toolbar element.
	 * Injects/removes the bulk button when the toolbar enters/leaves select mode.
	 */
	function watchToolbarMode( toolbar ) {
		var observer = new MutationObserver( function () {
			if ( toolbar.classList.contains( 'media-toolbar-mode-select' ) ) {
				injectGridBulkButton( toolbar );
			} else {
				removeGridBulkButton( toolbar );
			}
		} );

		observer.observe( toolbar, { attributes: true, attributeFilter: [ 'class' ] } );

		if ( toolbar.classList.contains( 'media-toolbar-mode-select' ) ) {
			injectGridBulkButton( toolbar );
		}
	}

	// -------------------------------------------------------------------------
	// List view: intercept the bulk actions form submit
	// -------------------------------------------------------------------------

	function initListBulkIntercept() {
		var form = document.getElementById( 'posts-filter' );
		if ( ! form ) {
			return;
		}

		form.addEventListener( 'submit', function ( e ) {
			var selector = document.getElementById( 'bulk-action-selector-top' ) ||
				document.getElementById( 'bulk-action-selector-bottom' );

			if ( ! selector || selector.value !== 'moondream_generate_alt_text' ) {
				return;
			}

			e.preventDefault();

			var checked = form.querySelectorAll( 'input[name="media[]"]:checked' );
			if ( ! checked.length ) {
				return;
			}

			var items        = [];
			var skippedCount = 0;
			var skippedTypes = {};

			checked.forEach( function ( input ) {
				var id = parseInt( input.value, 10 );
				if ( ! id ) return;

				var row        = input.closest( 'tr' );
				// WordPress adds a subtype-{sanitized_subtype} class to each row.
				var classMatch = row ? row.className.match( /\bsubtype-([A-Za-z0-9_-]+)\b/ ) : null;
				var subtype    = classMatch ? classMatch[ 1 ] : '';

				if ( subtype && supportedSubtypesSanitized.indexOf( subtype ) === -1 ) {
					skippedCount++;
					skippedTypes[ subtype ] = true;
					return;
				}

				var filenameEl = row ? row.querySelector( '.filename strong' ) : null;
				var thumbEl    = row ? row.querySelector( 'img' ) : null;

				items.push( {
					id:       id,
					filename: filenameEl ? filenameEl.textContent.trim() : ( '#' + id ),
					thumb:    thumbEl ? thumbEl.src : '',
				} );
			} );

			var skippedLabels = Object.keys( skippedTypes ).map( subtypeLabel );

			if ( ! items.length ) {
				if ( skippedCount > 0 ) {
					var applyBtn = form.querySelector( '#doaction' ) || form.querySelector( '.button.action' );
					showIncompatibleNotice( applyBtn || form, skippedLabels );
				}
				return;
			}

			var anchorEl = form.querySelector( '#doaction' ) || form.querySelector( '.button.action' ) || form;
			prepareAndOpen( items, skippedCount, skippedLabels, anchorEl );
		} );
	}

	// -------------------------------------------------------------------------
	// Helpers
	// -------------------------------------------------------------------------

	function escHtml( str ) {
		var d = document.createElement( 'div' );
		d.textContent = str;
		return d.innerHTML;
	}

	// -------------------------------------------------------------------------
	// Bootstrap
	// -------------------------------------------------------------------------

	document.addEventListener( 'DOMContentLoaded', function () {
		// The media library grid is rendered asynchronously by wp.media/Backbone
		// after DOMContentLoaded. Wait for .media-toolbar to appear before setting
		// up the select-mode observer.
		var toolbar = document.querySelector( '.media-toolbar' );
		if ( toolbar ) {
			watchToolbarMode( toolbar );
		} else {
			var bodyObserver = new MutationObserver( function () {
				var t = document.querySelector( '.media-toolbar' );
				if ( t ) {
					bodyObserver.disconnect();
					watchToolbarMode( t );
				}
			} );
			bodyObserver.observe( document.body, { childList: true, subtree: true } );
		}

		initListBulkIntercept();
	} );
} )();
