=== Moondream Alt Text Generator ===
Contributors: aidanashby
Tags: alt text, accessibility, media library, AI, Moondream
Requires at least: 6.0
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.1.0
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Generates descriptive alt text for media library images using the Moondream Cloud vision API.

== Description ==

Moondream Alt Text Generator adds AI-powered alt text generation to the WordPress media library using the [Moondream Cloud](https://moondream.ai/) vision API.

**Features**

* Generate button in the media grid attachment details panel
* Generate button on the attachment edit page
* Bulk generation with a progress modal and a review/edit phase before saving
* Skip or overwrite existing alt text in bulk runs (configurable)
* Optional global context appended to every prompt (e.g. site subject matter)
* Truncation notice when generated text exceeds 125 characters
* Internal admin use only — no front-end output

**How it works**

1. Enter your Moondream Cloud API key in Settings > Moondream Alt Text.
2. Open any image in the media library and click **Generate alt text**.
3. Review the suggestion and click **Accept** to apply it, or generate again.

For bulk runs, select multiple images in the media library, choose **Generate alt text** from the bulk actions menu (list view) or the toolbar button (grid view), and review results before saving.

== Installation ==

1. Upload the `moondream-alt-text` folder to `/wp-content/plugins/`.
2. Activate the plugin through the **Plugins** screen in WordPress.
3. Go to **Settings > Moondream Alt Text** and enter your API key.

== Frequently Asked Questions ==

= Where do I get an API key? =

Sign up at [moondream.ai](https://moondream.ai/) to obtain a Moondream Cloud API key.

= Which image formats are supported? =

JPEG, PNG, GIF, WebP, AVIF, BMP, and TIFF. The server validates the format before sending to the API.

= How many images can I process at once in bulk? =

Up to 20 images per bulk run. If more are selected, the first 20 are processed.

= Does this plugin add anything to the front end? =

No. All output is confined to wp-admin.

= Are my images sent to a third party? =

Yes — images are sent to the Moondream Cloud API for processing. The plugin first attempts to send the image URL; if the API cannot access it, it falls back to sending a base64-encoded copy of the image. Review Moondream's privacy policy before use.

== Screenshots ==

1. Generate button in the media grid attachment details panel.
2. Bulk generation progress modal.
3. Review phase — edit or discard suggestions before saving.
4. Settings page.

== Changelog ==

= 1.1.0 =
* Added automatic update checking via GitHub Releases — updates now appear in the standard WordPress Plugins screen.
* Attachment filename is now passed to the API as a prompt hint (hyphens and underscores converted to spaces).
* Removed character-count instruction from the prompt; replaced with "single brief sentence" — vision models do not reliably count characters.
* Raised server-side hard character cap from 125 to 200 to reduce unwanted mid-sentence truncation.

= 1.0.0 =
* Initial release.

== Upgrade Notice ==

= 1.1.0 =
Adds automatic update support via GitHub Releases. Improved prompt and higher character cap reduces truncated descriptions.

= 1.0.0 =
Initial release.
