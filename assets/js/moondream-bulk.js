/* global moondreamData, wp */
( function () {
	'use strict';

	var data = window.moondreamData || {};
	var strings = data.strings || {};
	var bulkLimit = data.bulk_limit || 20;

	// -------------------------------------------------------------------------
	// Modal
	// -------------------------------------------------------------------------

	var modal = null;
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

		// Limit warning (shown if list was truncated)
		var limitWarn = document.createElement( 'div' );
		limitWarn.className = 'moondream-modal__limit-warn';
		limitWarn.textContent = strings.bulk_limit_warn || '';

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

		var closeBtn = document.createElement( 'button' );
		closeBtn.type = 'button';
		closeBtn.className = 'button';
		closeBtn.textContent = strings.close || 'Close';
		closeBtn.disabled = true;
		closeBtn.addEventListener( 'click', destroyModal );
		footer.appendChild( closeBtn );

		modalEl.appendChild( header );
		modalEl.appendChild( limitWarn );
		modalEl.appendChild( list );
		modalEl.appendChild( footer );
		overlayEl.appendChild( modalEl );
		document.body.appendChild( overlayEl );

		modal = {
			title: title,
			counter: counter,
			progressFill: progressFill,
			progressBar: progressBar,
			limitWarn: limitWarn,
			rows: rows,
			closeBtn: closeBtn,
			footer: footer,
			total: items.length,
			done: 0,
			succeeded: 0,
			failed: 0,
		};

		return modal;
	}

	function buildRow( item ) {
		var el = document.createElement( 'li' );
		el.className = 'moondream-modal__row';

		var thumb = document.createElement( 'img' );
		thumb.className = 'moondream-modal__thumb';
		thumb.width = 50;
		thumb.height = 50;
		thumb.alt = '';
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

		// Start with spinner
		var spinner = document.createElement( 'span' );
		spinner.className = 'spinner';
		status.appendChild( spinner );

		el.appendChild( thumb );
		el.appendChild( filename );
		el.appendChild( status );

		return { el: el, status: status, id: item.id, generatedText: null, discarded: false, reviewInput: null };
	}

	function markRowGenerated( row ) {
		// Temporary success tick during generation phase; replaced in review phase.
		row.status.innerHTML = '<span class="moondream-modal__status--success">&#10003;</span>';
	}

	function markRowSkipped( row ) {
		row.status.innerHTML = '<span class="moondream-modal__status--skipped">' + escHtml( strings.skipped || 'Skipped' ) + '</span>';
	}

	function markRowError( row, message ) {
		var errorSpan = document.createElement( 'span' );
		errorSpan.className = 'moondream-modal__status--error';
		errorSpan.textContent = message;

		var retryBtn = document.createElement( 'button' );
		retryBtn.type = 'button';
		retryBtn.className = 'moondream-retry-single';
		retryBtn.textContent = strings.retry || 'Retry';

		retryBtn.addEventListener( 'click', function () {
			retryBtn.disabled = true;
			// Restore spinner while retrying
			row.status.innerHTML = '';
			var spinner = document.createElement( 'span' );
			spinner.className = 'spinner';
			row.status.appendChild( spinner );

			// Adjust counts: this row was counted as failed, un-count it
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
		// Update header
		modal.title.textContent = strings.review_header || 'Review generated alt text';
		modal.counter.textContent =
			modal.succeeded + ' ' + ( strings.succeeded || 'succeeded' ) +
			( modal.failed > 0 ? ', ' + modal.failed + ' ' + ( strings.failed || 'failed' ) : '' );

		// Hide progress bar
		modal.progressBar.style.display = 'none';

		// Transform each generated row into an editable review row
		modal.rows.forEach( function ( row ) {
			if ( ! row.generatedText ) {
				return; // skipped or failed — leave status as-is
			}

			var input = document.createElement( 'input' );
			input.type = 'text';
			input.className = 'moondream-modal__review-input';
			input.value = row.generatedText;
			row.reviewInput = input;

			var discardBtn = document.createElement( 'button' );
			discardBtn.type = 'button';
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

		// Add "Save all" button to footer (before Close)
		var saveAllBtn = document.createElement( 'button' );
		saveAllBtn.type = 'button';
		saveAllBtn.className = 'button button-primary';
		saveAllBtn.textContent = strings.save_all || 'Save all';
		saveAllBtn.addEventListener( 'click', function () {
			saveAllBtn.disabled = true;
			saveAll( saveAllBtn );
		} );
		modal.footer.insertBefore( saveAllBtn, modal.closeBtn );
		modal.saveAllBtn = saveAllBtn;

		// Enable Close
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
			formData.append( 'action', 'moondream_save_alt_text' );
			formData.append( 'nonce', data.nonce );
			formData.append( 'attachment_id', row.id );
			formData.append( 'alt_text', altText );

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
		modal = null;
		overlayEl = null;
	}

	// -------------------------------------------------------------------------
	// AJAX — generate one image (generation phase)
	// -------------------------------------------------------------------------

	function processOne( row ) {
		var formData = new FormData();
		formData.append( 'action', 'moondream_generate_bulk' );
		formData.append( 'nonce', data.nonce );
		formData.append( 'attachment_id', row.id );
		// Explicit string — wp_localize_script may serialise booleans as 1/"" on
		// older WP versions; the PHP handler expects the literal string 'true'.
		formData.append( 'overwrite', data.bulk_overwrite ? 'true' : 'false' );

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
					} else {
						// Store text for review phase; do not write to DB yet.
						row.generatedText = json.data.alt_text;
						markRowGenerated( row );
					}
					modal.succeeded++;
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
			await processOne( rows[ i ] );
			updateProgress();
		}
	}

	// -------------------------------------------------------------------------
	// Open bulk modal
	// -------------------------------------------------------------------------

	function openBulkModal( items, wasLimited ) {
		if ( modal ) {
			return; // Modal already open
		}

		var m = createModal( items );

		if ( wasLimited ) {
			m.limitWarn.classList.add( 'is-visible' );
		}

		processSequentially( m.rows );
	}

	// -------------------------------------------------------------------------
	// Collect attachment data from wp.media frame (grid view)
	// -------------------------------------------------------------------------

	function getGridSelectionItems() {
		// Read directly from the DOM — more reliable than wp.media.frame in the
		// Manage frame on upload.php. Bulk-selected <li> elements have class "selected".
		var selectedLis = document.querySelectorAll( '.attachments-browser .attachment.selected' );

		if ( ! selectedLis.length ) {
			// Fallback to wp.media Backbone selection.
			try {
				return wp.media.frame.state().get( 'selection' ).models.map( function ( m ) {
					var sizes = m.get( 'sizes' );
					var thumb = sizes && sizes.thumbnail ? sizes.thumbnail.url : ( m.get( 'url' ) || '' );
					return {
						id: m.get( 'id' ),
						filename: m.get( 'filename' ) || m.get( 'title' ) || ( '#' + m.get( 'id' ) ),
						thumb: thumb,
					};
				} );
			} catch ( e ) {
				return [];
			}
		}

		var items = [];
		selectedLis.forEach( function ( li ) {
			var id = parseInt( li.getAttribute( 'data-id' ), 10 );
			if ( ! id ) return;
			var thumbEl = li.querySelector( 'img' );
			var thumb = thumbEl ? thumbEl.src : '';
			// Filename is in .filename strong, or fall back to the aria-label / title attribute.
			var filenameEl = li.querySelector( '.filename strong' );
			var filename = filenameEl
				? filenameEl.textContent.trim()
				: ( li.getAttribute( 'aria-label' ) || ( '#' + id ) );
			items.push( { id: id, filename: filename, thumb: thumb } );
		} );
		return items;
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
		btn.type = 'button';
		btn.className = 'button moondream-generate-bulk';
		btn.textContent = strings.generate || 'Generate alt text';

		btn.addEventListener( 'click', function () {
			var items = getGridSelectionItems();
			if ( ! items.length ) return;

			var wasLimited = items.length > bulkLimit;
			if ( wasLimited ) {
				items = items.slice( 0, bulkLimit );
			}

			openBulkModal( items, wasLimited );
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

		// Handle initial state (toolbar might already be in select mode).
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

			var items = [];
			checked.forEach( function ( input ) {
				var id = parseInt( input.value, 10 );
				if ( ! id ) return;

				var row = input.closest( 'tr' );
				var filenameEl = row ? row.querySelector( '.filename strong' ) : null;
				var thumbEl = row ? row.querySelector( 'img' ) : null;

				items.push( {
					id: id,
					filename: filenameEl ? filenameEl.textContent.trim() : ( '#' + id ),
					thumb: thumbEl ? thumbEl.src : '',
				} );
			} );

			var wasLimited = items.length > bulkLimit;
			if ( wasLimited ) {
				items = items.slice( 0, bulkLimit );
			}

			openBulkModal( items, wasLimited );
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
