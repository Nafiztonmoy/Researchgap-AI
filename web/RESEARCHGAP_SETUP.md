# ResearchGap AI — local setup notes

## What is working in this source package

- Laravel authentication and email-verification flow
- Research project create/read/update/delete with ownership policies
- Polished dashboard, project workspace, project forms, paper library, responsive navigation, and subtle motion
- Protected PDF upload to `storage/app/private`
- PDF validation (PDF only, max 20 MB)
- Paper open/view action with project ownership authorization
- Paper delete and project delete cleanup protected files
- Upload progress and readable validation errors
- Flash success/error toasts
- Feature tests for project ownership and paper upload rules

The structured AI pipeline (FastAPI parsing, chunks, embeddings, paper analysis, comparison, gap detection, novelty verification) is intentionally not presented as complete yet. The UI marks those stages as locked until the backend exists.

## Windows / Laravel Herd PHP upload limits

The app accepts PDFs up to 20 MB, so PHP itself must allow a slightly larger request.

Find the active PHP configuration:

```powershell
php --ini
```

For a typical Herd PHP 8.4 install, edit the loaded `php.ini` and set:

```ini
upload_max_filesize = 25M
post_max_size = 30M
```

Restart `composer run dev`, then verify:

```powershell
php -i | Select-String "upload_max_filesize|post_max_size"
```

## Install and run

Keep your existing `.env` file. This package intentionally does not need a new application key.

```powershell
composer install
npm install
php artisan optimize:clear
php artisan wayfinder:generate --with-form
php artisan migrate
composer run dev
```

Open:

- `http://localhost:8000/`
- `http://localhost:8000/dashboard`
- `http://localhost:8000/projects`
- `http://localhost:8000/papers`

## If Wayfinder imports go missing on Windows

Stop duplicate Vite processes first. Only one `composer run dev` should be active.

```powershell
Get-NetTCPConnection -LocalPort 5173,5174,5175 -State Listen -ErrorAction SilentlyContinue |
Select-Object LocalPort,OwningProcess
```

Then regenerate:

```powershell
php artisan route:clear
php artisan optimize:clear
php artisan wayfinder:generate --with-form
```

## Next implementation milestone

Connect the Python FastAPI service in this order:

1. Parse PDF page text with PyMuPDF.
2. Detect academic sections.
3. Store `paper_sections` and `paper_chunks`.
4. Add embeddings / pgvector.
5. Add structured paper analysis with evidence IDs.
6. Build cross-paper comparison.
7. Generate evidence-backed gap candidates.
8. Add external literature search and novelty verification.
