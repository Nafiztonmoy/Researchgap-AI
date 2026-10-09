<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePaperRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'paper' => [
                'bail',
                'required',
                'file',
                'mimes:pdf',
                'max:20480',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'paper.required' => 'Please select a PDF file.',
            'paper.uploaded' => 'The server rejected this PDF before Laravel could read it. Make sure PHP upload_max_filesize is at least 25M and post_max_size is at least 30M.',
            'paper.file' => 'The selected upload is not a valid file.',
            'paper.mimes' => 'Only PDF files are allowed.',
            'paper.max' => 'The PDF may not be larger than 20 MB.',
        ];
    }
}
