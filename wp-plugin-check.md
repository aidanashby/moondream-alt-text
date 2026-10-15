# Plugin Check Report

**Plugin:** Moondream Alt Text Generator
**Generated at:** 2026-10-14 15:29:42


## `C:\Users\aidan\Studio\divi-5\wp-content\plugins\moondream-alt-text\includes\class-core.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 29 | 3 | WARNING | PluginCheck.CodeAnalysis.DiscouragedFunctions.load_plugin_textdomainFound | load_plugin_textdomain() has been discouraged since WordPress version 4.6. When your plugin is hosted on WordPress.org, you no longer need to manually include this function call for translations under your plugin slug. WordPress will automatically load the translations for you as needed. | [Docs](https://make.wordpress.org/core/2016/07/06/i18n-improvements-in-4-6/) |
| 86 | 25 | ERROR | WordPress.WP.I18n.UnorderedPlaceholdersText | Multiple placeholders in translatable strings should be ordered. Expected "%1$d, %2$d", but got "%d, %d" in 'You can generate alt text for up to %d images at a time. The first %d compatible images will be processed.'. | [Docs](https://developer.wordpress.org/plugins/internationalization/how-to-internationalize-your-plugin/#variables) |
| 180 | 15 | WARNING | WordPress.Security.NonceVerification.Recommended | Processing form data without nonce verification. |  |

## `C:\Users\aidan\Studio\divi-5\wp-content\plugins\moondream-alt-text\plugin-update-checker\Puc\v5p7\Plugin\Package.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 124 | 26 | WARNING | WordPress.WP.I18n.LowLevelTranslationFunction | Use of the &quot;translate()&quot; function is reserved for low-level API usage. | [Docs](https://developer.wordpress.org/plugins/internationalization/how-to-internationalize-your-plugin/) |
| 124 | 36 | ERROR | WordPress.WP.I18n.NonSingularStringLiteralText | The $text parameter must be a single text string literal. Found: $header['Name'] | [Docs](https://developer.wordpress.org/plugins/internationalization/how-to-internationalize-your-plugin/#basic-strings) |
| 124 | 53 | ERROR | WordPress.WP.I18n.NonSingularStringLiteralDomain | The $domain parameter must be a single text string literal. Found: $header['TextDomain'] | [Docs](https://developer.wordpress.org/plugins/internationalization/how-to-internationalize-your-plugin/#basic-strings) |

## `C:\Users\aidan\Studio\divi-5\wp-content\plugins\moondream-alt-text\plugin-update-checker\Puc\v5p7\Plugin\Ui.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 56 | 43 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound | Hook names invoked by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$this-&gt;updateChecker-&gt;getUniqueName(&#039;view_details_link&#039;)&quot;. |  |
| 56 | 101 | ERROR | WordPress.WP.I18n.MissingArgDomain | Missing $domain parameter in function call to __(). | [Docs](https://developer.wordpress.org/plugins/internationalization/how-to-internationalize-your-plugin/) |
| 68 | 37 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound | Hook names invoked by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$this-&gt;updateChecker-&gt;getUniqueName(&#039;view_details_link_position&#039;)&quot;. |  |
| 79 | 42 | ERROR | WordPress.WP.I18n.MissingArgDomain | Missing $domain parameter in function call to __(). | [Docs](https://developer.wordpress.org/plugins/internationalization/how-to-internationalize-your-plugin/) |
| 79 | 42 | ERROR | WordPress.WP.I18n.MissingTranslatorsComment | A function call to __() with texts containing placeholders was found, but was not accompanied by a "translators:" comment on the line above to clarify the meaning of the placeholders. | [Docs](https://developer.wordpress.org/plugins/internationalization/how-to-internationalize-your-plugin/#descriptions) |
| 129 | 21 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound | Hook names invoked by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$this-&gt;updateChecker-&gt;getUniqueName(&#039;manual_check_link&#039;)&quot;. |  |
| 130 | 45 | ERROR | WordPress.WP.I18n.TextDomainMismatch | Mismatched text domain. Expected 'moondream-alt-text' but got 'plugin-update-checker'. | [Docs](https://developer.wordpress.org/plugins/internationalization/how-to-internationalize-your-plugin/) |
| 217 | 40 | ERROR | WordPress.WP.I18n.MissingTranslatorsComment | A function call to _x() with texts containing placeholders was found, but was not accompanied by a "translators:" comment on the line above to clarify the meaning of the placeholders. | [Docs](https://developer.wordpress.org/plugins/internationalization/how-to-internationalize-your-plugin/#descriptions) |
| 217 | 95 | ERROR | WordPress.WP.I18n.TextDomainMismatch | Mismatched text domain. Expected 'moondream-alt-text' but got 'plugin-update-checker'. | [Docs](https://developer.wordpress.org/plugins/internationalization/how-to-internationalize-your-plugin/) |
| 219 | 40 | ERROR | WordPress.WP.I18n.MissingTranslatorsComment | A function call to _x() with texts containing placeholders was found, but was not accompanied by a "translators:" comment on the line above to clarify the meaning of the placeholders. | [Docs](https://developer.wordpress.org/plugins/internationalization/how-to-internationalize-your-plugin/#descriptions) |
| 219 | 111 | ERROR | WordPress.WP.I18n.TextDomainMismatch | Mismatched text domain. Expected 'moondream-alt-text' but got 'plugin-update-checker'. | [Docs](https://developer.wordpress.org/plugins/internationalization/how-to-internationalize-your-plugin/) |
| 221 | 40 | ERROR | WordPress.WP.I18n.MissingTranslatorsComment | A function call to _x() with texts containing placeholders was found, but was not accompanied by a "translators:" comment on the line above to clarify the meaning of the placeholders. | [Docs](https://developer.wordpress.org/plugins/internationalization/how-to-internationalize-your-plugin/#descriptions) |
| 221 | 119 | ERROR | WordPress.WP.I18n.TextDomainMismatch | Mismatched text domain. Expected 'moondream-alt-text' but got 'plugin-update-checker'. | [Docs](https://developer.wordpress.org/plugins/internationalization/how-to-internationalize-your-plugin/) |
| 227 | 40 | ERROR | WordPress.WP.I18n.MissingTranslatorsComment | A function call to __() with texts containing placeholders was found, but was not accompanied by a "translators:" comment on the line above to clarify the meaning of the placeholders. | [Docs](https://developer.wordpress.org/plugins/internationalization/how-to-internationalize-your-plugin/#descriptions) |
| 227 | 81 | ERROR | WordPress.WP.I18n.TextDomainMismatch | Mismatched text domain. Expected 'moondream-alt-text' but got 'plugin-update-checker'. | [Docs](https://developer.wordpress.org/plugins/internationalization/how-to-internationalize-your-plugin/) |
| 235 | 21 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound | Hook names invoked by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$this-&gt;updateChecker-&gt;getUniqueName(&#039;manual_check_message&#039;)&quot;. |  |

## `C:\Users\aidan\Studio\divi-5\wp-content\plugins\moondream-alt-text\plugin-update-checker\Puc\v5p7\Vcs\PluginUpdateChecker.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 67 | 21 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound | Hook names invoked by a theme/plugin should start with the theme/plugin prefix. Found: &quot;puc_api_error&quot;. |  |
| 93 | 21 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound | Hook names invoked by a theme/plugin should start with the theme/plugin prefix. Found: &quot;puc_api_error&quot;. |  |
| 113 | 91 | ERROR | WordPress.WP.I18n.TextDomainMismatch | Mismatched text domain. Expected 'moondream-alt-text' but got 'plugin-update-checker'. | [Docs](https://developer.wordpress.org/plugins/internationalization/how-to-internationalize-your-plugin/) |
| 125 | 35 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound | Hook names invoked by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$this-&gt;getUniqueName(&#039;request_info_result&#039;)&quot;. |  |

## `languages/.gitkeep`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | ERROR | hidden_files | Hidden files are not permitted. |  |

## `C:\Users\aidan\Studio\divi-5\wp-content\plugins\moondream-alt-text\includes\class-settings.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 164 | 17 | ERROR | WordPress.Security.EscapeOutput.OutputNotEscaped | All output should be run through an escaping function (see the Security sections in the WordPress Developer Handbooks), found '$max'. | [Docs](https://developer.wordpress.org/apis/security/escaping/#escaping-functions) |

## `C:\Users\aidan\Studio\divi-5\wp-content\plugins\moondream-alt-text\plugin-update-checker\Puc\v5p7\Vcs\BitBucketApi.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 26 | 93 | ERROR | WordPress.Security.EscapeOutput.ExceptionNotEscaped | All output should be run through an escaping function (see the Security sections in the WordPress Developer Handbooks), found '$repositoryUrl'. | [Docs](https://developer.wordpress.org/apis/security/escaping/) |
| 213 | 27 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound | Hook names invoked by a theme/plugin should start with the theme/plugin prefix. Found: &quot;puc_api_error&quot;. |  |
| 234 | 23 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound | Hook names invoked by a theme/plugin should start with the theme/plugin prefix. Found: &quot;puc_api_error&quot;. |  |

## `C:\Users\aidan\Studio\divi-5\wp-content\plugins\moondream-alt-text\plugin-update-checker\Puc\v5p7\Vcs\GitHubApi.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 38 | 90 | ERROR | WordPress.Security.EscapeOutput.ExceptionNotEscaped | All output should be run through an escaping function (see the Security sections in the WordPress Developer Handbooks), found '$repositoryUrl'. | [Docs](https://developer.wordpress.org/apis/security/escaping/) |
| 248 | 27 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound | Hook names invoked by a theme/plugin should start with the theme/plugin prefix. Found: &quot;puc_api_error&quot;. |  |
| 263 | 23 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound | Hook names invoked by a theme/plugin should start with the theme/plugin prefix. Found: &quot;puc_api_error&quot;. |  |

## `C:\Users\aidan\Studio\divi-5\wp-content\plugins\moondream-alt-text\plugin-update-checker\Puc\v5p7\Vcs\GitLabApi.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 63 | 98 | ERROR | WordPress.Security.EscapeOutput.ExceptionNotEscaped | All output should be run through an escaping function (see the Security sections in the WordPress Developer Handbooks), found '$repositoryUrl'. | [Docs](https://developer.wordpress.org/apis/security/escaping/) |
| 80 | 94 | ERROR | WordPress.Security.EscapeOutput.ExceptionNotEscaped | All output should be run through an escaping function (see the Security sections in the WordPress Developer Handbooks), found '$repositoryUrl'. | [Docs](https://developer.wordpress.org/apis/security/escaping/) |
| 265 | 27 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound | Hook names invoked by a theme/plugin should start with the theme/plugin prefix. Found: &quot;puc_api_error&quot;. |  |
| 279 | 23 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound | Hook names invoked by a theme/plugin should start with the theme/plugin prefix. Found: &quot;puc_api_error&quot;. |  |

## `C:\Users\aidan\Studio\divi-5\wp-content\plugins\moondream-alt-text\plugin-update-checker\Puc\v5p7\Vcs\ReleaseFilteringFeature.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 41 | 21 | ERROR | WordPress.Security.EscapeOutput.ExceptionNotEscaped | All output should be run through an escaping function (see the Security sections in the WordPress Developer Handbooks), found '$maxReleases'. | [Docs](https://developer.wordpress.org/apis/security/escaping/) |
| 46 | 21 | ERROR | WordPress.Security.EscapeOutput.ExceptionNotEscaped | All output should be run through an escaping function (see the Security sections in the WordPress Developer Handbooks), found '$maxReleases'. | [Docs](https://developer.wordpress.org/apis/security/escaping/) |

## `moondream-alt-text.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | ERROR | plugin_updater_detected | Including An Update Checker / Changing Updates functionality. Plugin Updater detected. Use of the Update URI header is not allowed in plugins hosted on WordPress.org. | [Docs](https://developer.wordpress.org/plugins/wordpress-org/common-issues/#update-checker) |
| 0 | 0 | ERROR | plugin_updater_detected | Plugin Updater detected. These are not permitted in WordPress.org hosted plugins. Detected: YahnisElsts\PluginUpdateChecker |  |
| 0 | 0 | ERROR | plugin_updater_detected | Plugin Updater detected. These are not permitted in WordPress.org hosted plugins. Detected: PucFactory::buildUpdateChecker |  |

## `plugin-update-checker/plugin-update-checker.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | ERROR | plugin_updater_detected | Plugin Updater detected. These are not permitted in WordPress.org hosted plugins. Detected: plugin-update-checker.php | [Docs](https://developer.wordpress.org/plugins/wordpress-org/common-issues/#update-checker) |
| 0 | 0 | ERROR | missing_direct_file_access_protection | PHP file should prevent direct access. Add a check like: if ( ! defined( 'ABSPATH' ) ) exit; | [Docs](https://developer.wordpress.org/plugins/wordpress-org/common-issues/#direct-file-access) |

## `plugin-update-checker/Puc/v5p7/Plugin/Ui.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | ERROR | plugin_updater_detected | Plugin Updater detected. These are not permitted in WordPress.org hosted plugins. Detected: 'plugin-update-checker' |  |
| 0 | 0 | ERROR | missing_direct_file_access_protection | PHP file should prevent direct access. Add a check like: if ( ! defined( 'ABSPATH' ) ) exit; | [Docs](https://developer.wordpress.org/plugins/wordpress-org/common-issues/#direct-file-access) |

## `plugin-update-checker/Puc/v5p7/Plugin/Package.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | ERROR | plugin_updater_detected | Plugin Updater detected. These are not permitted in WordPress.org hosted plugins. Detected: site_transient_update_plugins |  |
| 0 | 0 | ERROR | missing_direct_file_access_protection | PHP file should prevent direct access. Add a check like: if ( ! defined( 'ABSPATH' ) ) exit; | [Docs](https://developer.wordpress.org/plugins/wordpress-org/common-issues/#direct-file-access) |
| 0 | 0 | WARNING | update_modification_detected | Plugin Updater detected. Detected code which may be altering WordPress update routines. Detected: _site_transient_update_plugins | [Docs](https://developer.wordpress.org/plugins/wordpress-org/common-issues/#update-checker) |

## `plugin-update-checker/load-v5p7.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | ERROR | missing_direct_file_access_protection | PHP file should prevent direct access. Add a check like: if ( ! defined( 'ABSPATH' ) ) exit; | [Docs](https://developer.wordpress.org/plugins/wordpress-org/common-issues/#direct-file-access) |

## `plugin-update-checker/Puc/v5/PucFactory.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | ERROR | missing_direct_file_access_protection | PHP file should prevent direct access. Add a check like: if ( ! defined( 'ABSPATH' ) ) exit; | [Docs](https://developer.wordpress.org/plugins/wordpress-org/common-issues/#direct-file-access) |

## `plugin-update-checker/Puc/v5p7/Autoloader.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | ERROR | missing_direct_file_access_protection | PHP file should prevent direct access. Add a check like: if ( ! defined( 'ABSPATH' ) ) exit; | [Docs](https://developer.wordpress.org/plugins/wordpress-org/common-issues/#direct-file-access) |

## `plugin-update-checker/Puc/v5p7/DebugBar/Extension.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | ERROR | missing_direct_file_access_protection | PHP file should prevent direct access. Add a check like: if ( ! defined( 'ABSPATH' ) ) exit; | [Docs](https://developer.wordpress.org/plugins/wordpress-org/common-issues/#direct-file-access) |

## `plugin-update-checker/Puc/v5p7/DebugBar/Panel.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | ERROR | missing_direct_file_access_protection | PHP file should prevent direct access. Add a check like: if ( ! defined( 'ABSPATH' ) ) exit; | [Docs](https://developer.wordpress.org/plugins/wordpress-org/common-issues/#direct-file-access) |

## `plugin-update-checker/Puc/v5p7/DebugBar/PluginExtension.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | ERROR | missing_direct_file_access_protection | PHP file should prevent direct access. Add a check like: if ( ! defined( 'ABSPATH' ) ) exit; | [Docs](https://developer.wordpress.org/plugins/wordpress-org/common-issues/#direct-file-access) |

## `plugin-update-checker/Puc/v5p7/DebugBar/PluginPanel.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | ERROR | missing_direct_file_access_protection | PHP file should prevent direct access. Add a check like: if ( ! defined( 'ABSPATH' ) ) exit; | [Docs](https://developer.wordpress.org/plugins/wordpress-org/common-issues/#direct-file-access) |

## `plugin-update-checker/Puc/v5p7/DebugBar/ThemePanel.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | ERROR | missing_direct_file_access_protection | PHP file should prevent direct access. Add a check like: if ( ! defined( 'ABSPATH' ) ) exit; | [Docs](https://developer.wordpress.org/plugins/wordpress-org/common-issues/#direct-file-access) |

## `plugin-update-checker/Puc/v5p7/InstalledPackage.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | ERROR | missing_direct_file_access_protection | PHP file should prevent direct access. Add a check like: if ( ! defined( 'ABSPATH' ) ) exit; | [Docs](https://developer.wordpress.org/plugins/wordpress-org/common-issues/#direct-file-access) |

## `plugin-update-checker/Puc/v5p7/Metadata.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | ERROR | missing_direct_file_access_protection | PHP file should prevent direct access. Add a check like: if ( ! defined( 'ABSPATH' ) ) exit; | [Docs](https://developer.wordpress.org/plugins/wordpress-org/common-issues/#direct-file-access) |

## `plugin-update-checker/Puc/v5p7/OAuthSignature.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | ERROR | missing_direct_file_access_protection | PHP file should prevent direct access. Add a check like: if ( ! defined( 'ABSPATH' ) ) exit; | [Docs](https://developer.wordpress.org/plugins/wordpress-org/common-issues/#direct-file-access) |

## `plugin-update-checker/Puc/v5p7/Plugin/PluginInfo.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | ERROR | missing_direct_file_access_protection | PHP file should prevent direct access. Add a check like: if ( ! defined( 'ABSPATH' ) ) exit; | [Docs](https://developer.wordpress.org/plugins/wordpress-org/common-issues/#direct-file-access) |

## `plugin-update-checker/Puc/v5p7/Plugin/Update.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | ERROR | missing_direct_file_access_protection | PHP file should prevent direct access. Add a check like: if ( ! defined( 'ABSPATH' ) ) exit; | [Docs](https://developer.wordpress.org/plugins/wordpress-org/common-issues/#direct-file-access) |

## `plugin-update-checker/Puc/v5p7/Plugin/UpdateChecker.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | ERROR | missing_direct_file_access_protection | PHP file should prevent direct access. Add a check like: if ( ! defined( 'ABSPATH' ) ) exit; | [Docs](https://developer.wordpress.org/plugins/wordpress-org/common-issues/#direct-file-access) |

## `plugin-update-checker/Puc/v5p7/PucFactory.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | ERROR | missing_direct_file_access_protection | PHP file should prevent direct access. Add a check like: if ( ! defined( 'ABSPATH' ) ) exit; | [Docs](https://developer.wordpress.org/plugins/wordpress-org/common-issues/#direct-file-access) |

## `plugin-update-checker/Puc/v5p7/Scheduler.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | ERROR | missing_direct_file_access_protection | PHP file should prevent direct access. Add a check like: if ( ! defined( 'ABSPATH' ) ) exit; | [Docs](https://developer.wordpress.org/plugins/wordpress-org/common-issues/#direct-file-access) |

## `plugin-update-checker/Puc/v5p7/StateStore.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | ERROR | missing_direct_file_access_protection | PHP file should prevent direct access. Add a check like: if ( ! defined( 'ABSPATH' ) ) exit; | [Docs](https://developer.wordpress.org/plugins/wordpress-org/common-issues/#direct-file-access) |

## `plugin-update-checker/Puc/v5p7/Theme/Package.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | ERROR | missing_direct_file_access_protection | PHP file should prevent direct access. Add a check like: if ( ! defined( 'ABSPATH' ) ) exit; | [Docs](https://developer.wordpress.org/plugins/wordpress-org/common-issues/#direct-file-access) |

## `plugin-update-checker/Puc/v5p7/Theme/Update.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | ERROR | missing_direct_file_access_protection | PHP file should prevent direct access. Add a check like: if ( ! defined( 'ABSPATH' ) ) exit; | [Docs](https://developer.wordpress.org/plugins/wordpress-org/common-issues/#direct-file-access) |

## `plugin-update-checker/Puc/v5p7/Theme/UpdateChecker.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | ERROR | missing_direct_file_access_protection | PHP file should prevent direct access. Add a check like: if ( ! defined( 'ABSPATH' ) ) exit; | [Docs](https://developer.wordpress.org/plugins/wordpress-org/common-issues/#direct-file-access) |

## `plugin-update-checker/Puc/v5p7/Update.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | ERROR | missing_direct_file_access_protection | PHP file should prevent direct access. Add a check like: if ( ! defined( 'ABSPATH' ) ) exit; | [Docs](https://developer.wordpress.org/plugins/wordpress-org/common-issues/#direct-file-access) |

## `plugin-update-checker/Puc/v5p7/UpdateChecker.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | ERROR | missing_direct_file_access_protection | PHP file should prevent direct access. Add a check like: if ( ! defined( 'ABSPATH' ) ) exit; | [Docs](https://developer.wordpress.org/plugins/wordpress-org/common-issues/#direct-file-access) |

## `plugin-update-checker/Puc/v5p7/UpgraderStatus.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | ERROR | missing_direct_file_access_protection | PHP file should prevent direct access. Add a check like: if ( ! defined( 'ABSPATH' ) ) exit; | [Docs](https://developer.wordpress.org/plugins/wordpress-org/common-issues/#direct-file-access) |

## `plugin-update-checker/Puc/v5p7/Utils.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | ERROR | missing_direct_file_access_protection | PHP file should prevent direct access. Add a check like: if ( ! defined( 'ABSPATH' ) ) exit; | [Docs](https://developer.wordpress.org/plugins/wordpress-org/common-issues/#direct-file-access) |

## `plugin-update-checker/Puc/v5p7/Vcs/Api.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | ERROR | missing_direct_file_access_protection | PHP file should prevent direct access. Add a check like: if ( ! defined( 'ABSPATH' ) ) exit; | [Docs](https://developer.wordpress.org/plugins/wordpress-org/common-issues/#direct-file-access) |

## `plugin-update-checker/Puc/v5p7/Vcs/BaseChecker.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | ERROR | missing_direct_file_access_protection | PHP file should prevent direct access. Add a check like: if ( ! defined( 'ABSPATH' ) ) exit; | [Docs](https://developer.wordpress.org/plugins/wordpress-org/common-issues/#direct-file-access) |

## `plugin-update-checker/Puc/v5p7/Vcs/BitBucketApi.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | ERROR | missing_direct_file_access_protection | PHP file should prevent direct access. Add a check like: if ( ! defined( 'ABSPATH' ) ) exit; | [Docs](https://developer.wordpress.org/plugins/wordpress-org/common-issues/#direct-file-access) |

## `plugin-update-checker/Puc/v5p7/Vcs/GitHubApi.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | ERROR | missing_direct_file_access_protection | PHP file should prevent direct access. Add a check like: if ( ! defined( 'ABSPATH' ) ) exit; | [Docs](https://developer.wordpress.org/plugins/wordpress-org/common-issues/#direct-file-access) |

## `plugin-update-checker/Puc/v5p7/Vcs/GitLabApi.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | ERROR | missing_direct_file_access_protection | PHP file should prevent direct access. Add a check like: if ( ! defined( 'ABSPATH' ) ) exit; | [Docs](https://developer.wordpress.org/plugins/wordpress-org/common-issues/#direct-file-access) |

## `plugin-update-checker/Puc/v5p7/Vcs/PluginUpdateChecker.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | ERROR | missing_direct_file_access_protection | PHP file should prevent direct access. Add a check like: if ( ! defined( 'ABSPATH' ) ) exit; | [Docs](https://developer.wordpress.org/plugins/wordpress-org/common-issues/#direct-file-access) |

## `plugin-update-checker/Puc/v5p7/Vcs/Reference.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | ERROR | missing_direct_file_access_protection | PHP file should prevent direct access. Add a check like: if ( ! defined( 'ABSPATH' ) ) exit; | [Docs](https://developer.wordpress.org/plugins/wordpress-org/common-issues/#direct-file-access) |

## `plugin-update-checker/Puc/v5p7/Vcs/ReleaseAssetSupport.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | ERROR | missing_direct_file_access_protection | PHP file should prevent direct access. Add a check like: if ( ! defined( 'ABSPATH' ) ) exit; | [Docs](https://developer.wordpress.org/plugins/wordpress-org/common-issues/#direct-file-access) |

## `plugin-update-checker/Puc/v5p7/Vcs/ReleaseFilteringFeature.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | ERROR | missing_direct_file_access_protection | PHP file should prevent direct access. Add a check like: if ( ! defined( 'ABSPATH' ) ) exit; | [Docs](https://developer.wordpress.org/plugins/wordpress-org/common-issues/#direct-file-access) |

## `plugin-update-checker/Puc/v5p7/Vcs/ThemeUpdateChecker.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | ERROR | missing_direct_file_access_protection | PHP file should prevent direct access. Add a check like: if ( ! defined( 'ABSPATH' ) ) exit; | [Docs](https://developer.wordpress.org/plugins/wordpress-org/common-issues/#direct-file-access) |

## `plugin-update-checker/Puc/v5p7/Vcs/VcsCheckerMethods.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | ERROR | missing_direct_file_access_protection | PHP file should prevent direct access. Add a check like: if ( ! defined( 'ABSPATH' ) ) exit; | [Docs](https://developer.wordpress.org/plugins/wordpress-org/common-issues/#direct-file-access) |

## `C:\Users\aidan\Studio\divi-5\wp-content\plugins\moondream-alt-text\plugin-update-checker\Puc\v5p7\DebugBar\Extension.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 56 | 13 | WARNING | WordPress.WP.EnqueuedResourceParameters.NotInFooter | In footer ($in_footer) is not set explicitly wp_enqueue_script; It is recommended to load scripts in the footer. Please set this value to \`true\` to load it in the footer, or explicitly \`false\` if it should be loaded in the header. |  |
| 153 | 4 | WARNING | PluginCheck.CodeAnalysis.PHPErrorReporting.DirectErrorReportingCall | Detected production-time change to PHP error reporting: error_reporting(). | [Docs](https://www.php.net/manual/en/function.error-reporting.php) |
| 155 | 5 | WARNING | PluginCheck.CodeAnalysis.PHPErrorReporting.IniDirectiveDisplay_errors | Detected production-time change to PHP error reporting: ini_set(). | [Docs](https://www.php.net/manual/en/function.error-reporting.php) |

## `moondream-alt-text-spec.md`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 0 | 0 | WARNING | unexpected_markdown_file | Unexpected markdown file "moondream-alt-text-spec.md" detected in plugin root. Only specific markdown files are expected in production plugins. |  |

## `C:\Users\aidan\Studio\divi-5\wp-content\plugins\moondream-alt-text\includes\class-ajax.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 274 | 13 | WARNING | WordPress.DB.SlowDBQuery.slow_db_query_meta_query | Detected usage of meta_query, possible slow query. |  |
| 289 | 52 | WARNING | WordPress.Security.ValidatedSanitizedInput.MissingUnslash | $_POST[&#039;post__in&#039;] not unslashed before sanitization. Use wp_unslash() or similar |  |
| 289 | 52 | WARNING | WordPress.Security.ValidatedSanitizedInput.InputNotSanitized | Detected usage of a non-sanitized input variable: $_POST[&#039;post__in&#039;] |  |

## `C:\Users\aidan\Studio\divi-5\wp-content\plugins\moondream-alt-text\plugin-update-checker\load-v5p7.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 27 | 8 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$pucGeneralClass&quot;. |  |
| 27 | 28 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound | Global variables defined by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$pucVersionedClass&quot;. |  |

## `C:\Users\aidan\Studio\divi-5\wp-content\plugins\moondream-alt-text\plugin-update-checker\Puc\v5p7\Metadata.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 46 | 27 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound | Hook names invoked by a theme/plugin should start with the theme/plugin prefix. Found: &quot;puc_api_error&quot;. |  |
| 54 | 27 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound | Hook names invoked by a theme/plugin should start with the theme/plugin prefix. Found: &quot;puc_api_error&quot;. |  |
| 120 | 41 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound | Hook names invoked by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$this-&gt;getPrefixedFilter(&#039;retain_fields&#039;) . &#039;-&#039; . $from-&gt;slug&quot;. |  |

## `C:\Users\aidan\Studio\divi-5\wp-content\plugins\moondream-alt-text\plugin-update-checker\Puc\v5p7\Plugin\UpdateChecker.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 56 | 41 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound | Hook names invoked by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$slugCheckFilter&quot;. |  |
| 149 | 41 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound | Hook names invoked by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$this-&gt;getUniqueName(&#039;request_info_result&#039;)&quot;. |  |
| 196 | 41 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound | Hook names invoked by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$this-&gt;getUniqueName(&#039;pre_inject_info&#039;)&quot;. |  |

## `C:\Users\aidan\Studio\divi-5\wp-content\plugins\moondream-alt-text\plugin-update-checker\Puc\v5p7\PucFactory.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 231 | 39 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound | Hook names invoked by a theme/plugin should start with the theme/plugin prefix. Found: &quot;puc_get_source_uri&quot;. |  |
| 276 | 34 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound | Hook names invoked by a theme/plugin should start with the theme/plugin prefix. Found: &quot;puc_get_vcs_service&quot;. |  |

## `C:\Users\aidan\Studio\divi-5\wp-content\plugins\moondream-alt-text\plugin-update-checker\Puc\v5p7\Scheduler.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 69 | 25 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound | Hook names invoked by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$this-&gt;updateChecker-&gt;getUniqueName(&#039;first_check_time&#039;)&quot;. |  |
| 207 | 17 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound | Hook names invoked by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$this-&gt;updateChecker-&gt;getUniqueName(&#039;check_now&#039;)&quot;. |  |

## `C:\Users\aidan\Studio\divi-5\wp-content\plugins\moondream-alt-text\plugin-update-checker\Puc\v5p7\UpdateChecker.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 138 | 17 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound | Hook names invoked by a theme/plugin should start with the theme/plugin prefix. Found: &quot;plugin_locale&quot;. |  |
| 297 | 17 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound | Hook names invoked by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$this-&gt;getUniqueName(&#039;remove_from_default_update_checks&#039;)&quot;. |  |
| 441 | 37 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound | Hook names invoked by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$this-&gt;getUniqueName(&#039;request_update_result&#039;)&quot;. |  |
| 634 | 41 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound | Hook names invoked by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$this-&gt;getUniqueName(&#039;pre_inject_update&#039;)&quot;. |  |
| 767 | 17 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound | Hook names invoked by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$this-&gt;getUniqueName(&#039;autoupdate_field_allowed&#039;)&quot;. |  |
| 796 | 40 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound | Hook names invoked by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$this-&gt;getUniqueName($filterRoot . &#039;_query_args&#039;)&quot;. |  |
| 805 | 38 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound | Hook names invoked by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$this-&gt;getUniqueName($filterRoot . &#039;_options&#039;)&quot;. |  |
| 815 | 37 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound | Hook names invoked by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$this-&gt;getUniqueName(&#039;request_metadata_http_result&#039;)&quot;. |  |
| 826 | 27 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound | Hook names invoked by a theme/plugin should start with the theme/plugin prefix. Found: &quot;puc_api_error&quot;. |  |

## `C:\Users\aidan\Studio\divi-5\wp-content\plugins\moondream-alt-text\plugin-update-checker\Puc\v5p7\Vcs\Api.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 110 | 21 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound | Hook names invoked by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$this-&gt;strategyFilterName&quot;. |  |
| 345 | 42 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound | Hook names invoked by a theme/plugin should start with the theme/plugin prefix. Found: &quot;$this-&gt;httpFilterName&quot;. |  |

## `C:\Users\aidan\Studio\divi-5\wp-content\plugins\moondream-alt-text\plugin-update-checker\Puc\v5p7\Vcs\ThemeUpdateChecker.php`

| Line | Column | Type | Code | Message | Docs |
| --- | --- | --- | --- | --- | --- |
| 46 | 21 | WARNING | WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound | Hook names invoked by a theme/plugin should start with the theme/plugin prefix. Found: &quot;puc_api_error&quot;. |  |
