from .models import KnowledgeEntry


def call_ai_agent(query: str) -> str:
    keywords = (query or "").split()
    relevant_entries = KnowledgeEntry.objects.none()
    for kw in keywords:
        if len(kw) > 3:
            relevant_entries |= KnowledgeEntry.objects.filter(content__icontains=kw) | KnowledgeEntry.objects.filter(
                title__icontains=kw
            )

    context = "\n\n".join([f"Source: {e.title}\nContent: {e.content}" for e in relevant_entries.distinct()[:5]])

    if not context:
        context = "No specific knowledge found in the database. Please provide a general advisory."

    q = (query or "").lower()
    if "fruit fly" in q:
        return f"AI Advisory: To manage fruit flies, ensure orchard sanitation and use protein baiting. Context: {context}"
    if "root rot" in q:
        return (
            f"AI Advisory: Avocado root rot is best managed through drainage and resistant rootstocks. Context: {context}"
        )
    return (
        "AI Advisory based on knowledge base: \n"
        f"{context}\n\n"
        "Conclusion: For specific pest issues, please consult with an agronomist."
    )

