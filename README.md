# sami.codes

Source for [sami.codes](https://sami.codes), my personal site for sharing projects and writing.

The site runs on [Grav](https://getgrav.org), a flat-file CMS, hosted on Hostinger. This repository is the Grav `user` folder:

```
config/          site, system and plugin settings
pages/           content (home page and blog posts, in Markdown)
themes/sami/     the theme (Twig templates, Tailwind CSS, JavaScript)
```

## Editing content

- **In the browser:** log in at `sami.codes/admin`. Git Sync commits the change and pushes it here.
- **In Git:** edit the Markdown in `pages/` and push to `main`. The GitHub webhook tells Git Sync to pull it onto the server.

A blog post lives in its own folder under `pages/02.blog/`, in a file called `item.md`:

```yaml
---
title: 'Post title'
description: 'One line for cards, search results and social shares.'
date: '2026-11-01 00:00'
taxonomy:
  tag:
    - git
    - beginners
published: false   # remove this line to publish
---

Post content in Markdown.
```

The home page text, stack and project cards are set in `pages/01.home/home.md`. They also have their own fields in the admin panel.

Theme settings (contact email, Google Analytics ID, social links) are under **Themes > Sami** in the admin panel.

## Changing the CSS

The theme's styles are built with Tailwind. The built file `themes/sami/css/site.css` is committed, so the server needs no build step.

```
cd themes/sami
npm install
npm run build    # or npm run watch while editing
```

Run the build after adding new Tailwind classes to a template, then commit `css/site.css`.

## URLs

| Page | URL |
| --- | --- |
| Blog | `/blog` |
| Tag listing | `/blog/tags/<tag>` |
| RSS | `/blog.rss` (`/rss.xml` redirects here) |
| Sitemap | `/sitemap.xml` (`/sitemap-index.xml` redirects here) |

## Setting up on Hostinger

These steps are for a Hostinger web hosting plan managed in hPanel. Grav 2 needs PHP 8.3 or newer.

### 1. Prepare the hosting

1. In hPanel, add sami.codes as a website (or open it if it is already there).
2. Go to **Advanced > PHP Configuration** and pick PHP 8.3 or newer.
3. Go to **Advanced > SSH Access** and turn SSH on. Note the login details.

### 2. Install Grav

1. Download **Grav + Admin** from [getgrav.org/downloads](https://getgrav.org/downloads).
2. In hPanel **File Manager**, open `public_html`, delete the default `index.php` or `default.php` if there is one, upload the zip and extract it.
3. Move everything from the extracted `grav-admin` folder up into `public_html`, so `index.php` sits directly inside `public_html`.

### 3. Swap in this repository as the `user` folder

Connect with SSH, then:

```
cd ~/domains/sami.codes/public_html
mv user user-original
git clone https://github.com/sami/sami.codes.git user
cp -r user-original/plugins user/
mkdir -p user/accounts user/data
```

Then install the plugins the site needs:

```
bin/gpm install feed sitemap taxonomylist git-sync -y
```

### 4. Create the admin account

Visit `https://sami.codes/admin` (or the temporary Hostinger URL if DNS has not moved yet) and create your admin user.

### 5. Connect Git Sync

1. In the admin panel, open **Plugins > Git Sync** and run the setup wizard.
2. Choose GitHub, enter your username and a [fine-grained personal access token](https://github.com/settings/personal-access-tokens) with **Contents: read and write** on this repository only.
3. Repository: `https://github.com/sami/sami.codes.git`, branch `main`.
4. Under **Folders to sync**, tick `pages`, `themes` and `config`.
5. Copy the webhook URL the wizard shows. In GitHub, go to **Settings > Webhooks > Add webhook**, paste it, set the content type to `application/json` and save.

### 6. Point the domain at Hostinger

1. In hPanel, open **Domains > DNS / Nameservers** and follow Hostinger's steps for pointing sami.codes at the hosting. Either switch the nameservers to Hostinger or change the A record to the IP hPanel shows.
2. If `hello@sami.codes` email is handled somewhere else, copy its MX and TXT records across before switching nameservers, or email will stop arriving.
3. Turn on SSL in hPanel under **Security > SSL** once the domain resolves.
4. In GitHub, go to **Settings > Pages** for this repository and unpublish the site, then remove the custom domain.

### 7. Finishing touches

- Add `Sitemap: https://sami.codes/sitemap.xml` to the end of `robots.txt` in `public_html`.
- Add your Google Analytics ID under **Themes > Sami** if you want analytics. The cookie banner only appears when an ID is set.
- Submit `https://sami.codes/sitemap.xml` in Google Search Console.
