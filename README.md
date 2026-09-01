# TenderDraft

### AI-powered RFP and Tender Response Generation

TenderDraft is an AI-powered platform designed to significantly reduce the time required to prepare responses to Requests for Proposals (RFPs) and tenders.

It uses AI to analyse bid documents, extract relevant information, and generate a structured draft response that can then be reviewed and edited by a human.

## The Problem

Preparing responses to RFPs and tenders can be a highly time-consuming process.

A typical bid can require teams to manually read through lengthy documents, identify requirements, understand eligibility criteria, extract important information, and draft responses accordingly.

Before TenderDraft, preparing a single RFP response could take approximately **2–3 days** of manual work.

## The Solution

TenderDraft automates the initial stages of this process using AI.

A user provides an RFP or tender document, and TenderDraft processes the document, extracts its text, and sends the relevant information to Claude's API.

Claude then analyses the bid and generates a structured draft response.

The generated response is not treated as a final answer. A human reviews and edits the output before using it, keeping human judgment in the workflow.

## Impact

- Reduced initial response generation from approximately **2–3 days to ~60 seconds**
- Human review and intervention remains part of the workflow
- Currently used by clients across India
- Built and deployed as a working product rather than a purely experimental project

## How It Works

1. **Upload**  
   The user provides an RFP or tender document, typically as a PDF.

2. **Document Processing**  
   The PDF is processed and its text is extracted.

3. **AI Analysis**  
   The extracted content is sent to Claude's API for analysis.

4. **Response Generation**  
   Claude identifies relevant information and generates a structured draft bid response.

5. **Human Review**  
   The user reviews, edits, and finalises the generated response.

6. **Final Bid**  
   The reviewed response can then be used as part of the bidding process.

## AI / ML

TenderDraft currently uses the **Claude API** for analysing bid documents and generating responses.

The current AI workflow consists of:

- PDF text extraction
- Structured prompting
- Claude API-based document analysis
- AI-generated response drafting
- Human-in-the-loop review

The focus is on using existing AI models effectively to solve a real-world workflow rather than training a model from scratch.

## Tech Stack

- **Next.js**
- **TypeScript**
- **Supabase**
- **Claude API**
- **PDF text extraction**
- **Vercel**

## Development

TenderDraft was developed using AI-assisted development tools alongside hands-on product development and iteration.

The project evolved from an initial idea into a deployed product currently being used by clients.

## What I Learned

Building TenderDraft gave me experience with:

- Integrating AI APIs into a real-world application
- Designing workflows around AI-generated output
- Working with large and unstructured documents
- Building human-in-the-loop systems
- Turning an idea into a deployed product
- Iterating based on real-world usage and requirements

## Future Improvements

Some areas I would like to explore further include:

- Improving the accuracy and consistency of generated responses
- Better extraction and organisation of requirements from complex tenders
- Providing the model with more relevant context when generating responses
- Building automated evaluation methods for AI-generated responses
- Improving document processing for different tender formats
- Further reducing the amount of manual work while maintaining human oversight

## Demo

Live application:

https://tenderdraft.vercel.app

## Note

This repository is intended to demonstrate the technical concepts and development behind TenderDraft.

Client data, confidential documents, credentials, and other sensitive information are not included.
