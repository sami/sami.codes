<?php
namespace Grav\Theme;

use Grav\Common\Theme;

class Sami extends Theme
{
    public static function getSubscribedEvents()
    {
        return [
            'onThemeInitialized' => ['onThemeInitialized', 0],
        ];
    }

    /**
     * Serve /blog/tags/<tag> as the blog listing filtered by that tag,
     * so the tag URLs from the old site keep working without a redirect.
     */
    public function onThemeInitialized()
    {
        if ($this->isAdmin()) {
            return;
        }

        $uri = $this->grav['uri'];
        $blog = rtrim($this->config->get('site.blog.route', '/blog'), '/');
        $pattern = '#^' . preg_quote($blog, '#') . '/tags/([^/:]+)/?$#';

        if (preg_match($pattern, $uri->path(), $matches)) {
            $tag = rawurldecode($matches[1]);
            $url = $uri->rootUrl(true) . $blog . '/tag' . $this->config->get('system.param_sep', ':') . rawurlencode($tag);
            $uri->initializeWithUrl($url)->init();
        }
    }
}
