import hashlib
import hmac
from io import BytesIO
from pathlib import Path
import qrcode

from .config import settings


def ensure_storage_path() -> Path:
    storage_dir = Path(settings.STORAGE_PATH)
    storage_dir.mkdir(parents=True, exist_ok=True)
    return storage_dir


def build_document_path(document_id: str, original_filename: str) -> str:
    storage_dir = ensure_storage_path()
    suffix = Path(original_filename).suffix
    filename = f"document_{document_id}{suffix}"
    return str(storage_dir / filename)


def build_qr_path(document_id: str) -> str:
    storage_dir = ensure_storage_path()
    filename = f"qr_{document_id}.png"
    return str(storage_dir / filename)


def build_signed_document_path(document_id: str) -> str:
    storage_dir = ensure_storage_path()
    filename = f"verified_{document_id}.pdf"
    return str(storage_dir / filename)


def create_qr_code(document_id: str, url: str) -> str:
    qr_path = build_qr_path(document_id)
    qr = qrcode.QRCode(version=1, box_size=10, border=2)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    img.save(qr_path)
    return qr_path


def embed_qr_code_in_pdf(
    *,
    source_pdf_path: str,
    qr_code_path: str,
    output_pdf_path: str,
    document_id: str,
    document_number: str,
    digital_signature: str,
) -> str:
    from pypdf import PdfReader, PdfWriter

    reader = PdfReader(source_pdf_path)
    writer = PdfWriter()

    if not reader.pages:
        raise ValueError("Uploaded PDF has no pages")

    last_page_index = len(reader.pages) - 1
    for index, page in enumerate(reader.pages):
        if index == last_page_index:
            width = float(page.mediabox.width)
            height = float(page.mediabox.height)
            overlay = _build_pdf_stamp(
                width=width,
                height=height,
                qr_code_path=qr_code_path,
                document_id=document_id,
                document_number=document_number,
                digital_signature=digital_signature,
            )
            page.merge_page(overlay)
        writer.add_page(page)

    with open(output_pdf_path, "wb") as output_file:
        writer.write(output_file)

    return output_pdf_path


def _build_pdf_stamp(
    *,
    width: float,
    height: float,
    qr_code_path: str,
    document_id: str,
    document_number: str,
    digital_signature: str,
):
    from pypdf import PdfReader
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.units import inch
    from reportlab.pdfgen import canvas

    packet = BytesIO()
    page_size = (width, height) if width and height else letter
    pdf_canvas = canvas.Canvas(packet, pagesize=page_size)

    margin = 0.45 * inch
    box_width = 3.8 * inch
    box_height = 1.05 * inch
    box_x = width - box_width - margin
    box_y = margin
    qr_size = 0.82 * inch

    pdf_canvas.setFillColorRGB(1, 1, 1)
    pdf_canvas.setStrokeColorRGB(0.1, 0.22, 0.18)
    pdf_canvas.roundRect(box_x, box_y, box_width, box_height, 6, stroke=1, fill=1)
    pdf_canvas.drawImage(
        qr_code_path,
        box_x + 0.12 * inch,
        box_y + 0.11 * inch,
        width=qr_size,
        height=qr_size,
        preserveAspectRatio=True,
        mask="auto",
    )

    text_x = box_x + 1.06 * inch
    text_y = box_y + 0.78 * inch
    pdf_canvas.setFillColorRGB(0.05, 0.08, 0.07)
    pdf_canvas.setFont("Helvetica-Bold", 8)
    pdf_canvas.drawString(text_x, text_y, "VeriDoc Authenticated Document")
    pdf_canvas.setFont("Helvetica", 6.6)
    pdf_canvas.drawString(text_x, text_y - 0.20 * inch, f"Document ID: {document_id}")
    pdf_canvas.drawString(text_x, text_y - 0.36 * inch, f"Document No: {document_number}")
    pdf_canvas.drawString(text_x, text_y - 0.52 * inch, f"Signature: {digital_signature[:24]}...")
    pdf_canvas.drawString(text_x, text_y - 0.68 * inch, "Scan QR to verify with Union Bank of Cameroon")

    pdf_canvas.save()
    packet.seek(0)
    return PdfReader(packet).pages[0]


def create_digital_signature(
    document_id: str,
    customer_name: str,
    document_number: str,
    file_content: bytes,
) -> str:
    payload = b":".join(
        [
            document_id.encode("utf-8"),
            customer_name.encode("utf-8"),
            document_number.encode("utf-8"),
            hashlib.sha256(file_content).hexdigest().encode("utf-8"),
        ]
    )
    return hmac.new(settings.SECRET_KEY.encode("utf-8"), payload, hashlib.sha256).hexdigest()


def verify_digital_signature(
    *,
    document_id: str,
    customer_name: str,
    document_number: str,
    file_content: bytes,
    expected_signature: str | None,
) -> bool:
    if not expected_signature:
        return False

    actual_signature = create_digital_signature(
        document_id=document_id,
        customer_name=customer_name,
        document_number=document_number,
        file_content=file_content,
    )
    return hmac.compare_digest(actual_signature, expected_signature)
