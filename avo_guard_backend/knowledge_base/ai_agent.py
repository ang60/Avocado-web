import requests
from django.conf import settings
from .models import KnowledgeEntry

def call_ai_agent(query):
    # Retrieve relevant context from KnowledgeEntry
    # In a real RAG (Retrieval-Augmented Generation) system, 
    # we'd use embeddings and a vector DB here. 
    # For now, let's just grab entries that match keywords in the query.
    
    keywords = query.split()
    relevant_entries = KnowledgeEntry.objects.none()
    for kw in keywords:
        if len(kw) > 3:
            relevant_entries |= KnowledgeEntry.objects.filter(content__icontains=kw) | KnowledgeEntry.objects.filter(title__icontains=kw)
    
    context = "\n\n".join([f"Source: {e.title}\nContent: {e.content}" for e in relevant_entries.distinct()[:5]])
    
    if not context:
        context = "No specific knowledge found in the database. Please provide a general advisory."

    # I'll simulate an AI Agent response. 
    # If there's an OPENAI_API_KEY in settings, I could call it. 
    # For now, I'll return a structured advisory based on the context.
    
    # Simple rule-based advisory for the demo
    if "fruit fly" in query.lower():
        return f"AI Advisory: To manage fruit flies, ensure orchard sanitation and use protein baiting. Context: {context}"
    elif "root rot" in query.lower():
        return f"AI Advisory: Avocado root rot is best managed through drainage and resistant rootstocks. Context: {context}"
    else:
        return f"AI Advisory based on knowledge base: \n{context}\n\nConclusion: For specific pest issues, please consult with an agronomist."
