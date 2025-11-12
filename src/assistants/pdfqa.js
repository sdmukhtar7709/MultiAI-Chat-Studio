// PDF-QA assistant adapter
// This adapter queries the backend /api/pdf/query endpoint for a specific document (docId)
// The docId can come from localStorage.getItem('pdf_doc_id') or from VITE_PDF_DOC_ID.

const DEFAULT_SERVER = import.meta.env.VITE_PDF_SERVER || "http://localhost:4001";

export class Assistant {
	constructor(model) {
		// model parameter is used as docId if provided
		this.docId = model || (typeof window !== "undefined" && window.localStorage ? window.localStorage.getItem("pdf_doc_id") : null) || import.meta.env.VITE_PDF_DOC_ID || null;
		this.server = import.meta.env.VITE_PDF_SERVER || DEFAULT_SERVER;
	}

	async chat(prompt) {
		if (!this.docId) throw new Error("PDF docId not configured. Provide model as docId or set localStorage pdf_doc_id or VITE_PDF_DOC_ID.");
		const res = await fetch(`${this.server}/api/pdf/query`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ docId: this.docId, question: prompt, topK: 4 }),
		});
		const json = await res.json();
		if (!res.ok) throw new Error(json.error || `PDF query failed: ${res.status}`);
		// append sources/confidence to the returned text for the UI
		return `${json.answer}\n\n[confidence: ${json.confidence}]\nSources: ${json.sources.map(s => `page:${s.page} score:${s.score.toFixed(3)}`).join("; ")}`;
	}

	// Optional streaming interface not implemented for this simple adapter
	chatStream() {
		throw new Error("Streaming not supported by pdfqa adapter");
	}
}

