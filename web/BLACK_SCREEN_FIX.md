# ResearchGap AI black-screen hotfix

This hotfix removes FlashToaster from the Inertia root/layout path.
The protected pages use AppLayout, while the landing page does not, which is why `/` could render while `/dashboard`, `/projects`, and `/papers` were blank.

Copy the `web` folder contents over your existing project and replace files.

Then run:

```powershell
php artisan optimize:clear
php artisan wayfinder:generate --with-form
composer run dev
```

Then hard refresh the browser with Ctrl+Shift+R.
