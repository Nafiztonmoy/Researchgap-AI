import os
import shutil
import tempfile

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.chunkers.paper_chunker import PaperChunker
from app.extractors.metadata_extractor import MetadataExtractor
from app.parsers.pdf_parser import PDFParser

router = APIRouter(
    prefix="/v1/papers",
    tags=["papers"],
)

pdf_parser = PDFParser()
paper_chunker = PaperChunker()
metadata_extractor = MetadataExtractor()


@router.post("/parse")
async def parse_paper(
    paper: UploadFile = File(...),
):
    if paper.content_type != "application/pdf":
        raise HTTPException(
            status_code=422,
            detail="Only PDF files are supported.",
        )

    temporary_path: str | None = None

    try:
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".pdf",
        ) as temporary_file:
            shutil.copyfileobj(
                paper.file,
                temporary_file,
            )

            temporary_path = temporary_file.name

        result = pdf_parser.parse(temporary_path)

        chunks = paper_chunker.chunk_pages(
            result["pages"]
        )

        metadata = metadata_extractor.extract(
            result["pages"]
        )

        return {
            "filename": paper.filename,
            "page_count": result["page_count"],
            "character_count": result["character_count"],
            "metadata": metadata,
            "pages": result["pages"],
            "chunks": chunks,
            "chunk_count": len(chunks),
        }

    except Exception as exception:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse PDF: {str(exception)}",
        )

    finally:
        await paper.close()

        if temporary_path and os.path.exists(temporary_path):
            os.remove(temporary_path)