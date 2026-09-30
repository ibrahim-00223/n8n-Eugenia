const gemini_Document_embeddings = embedding({ type: '@n8n/n8n-nodes-langchain.embeddingsGoogleGemini', version: 1, config: { name: 'Gemini Document embeddings', credentials: { googlePalmApi: newCredential('Google Gemini(PaLM) Api account', 'm8KyJpE3ONt9L7xo') }, position: [808, 552] } });
const split_Book_Text = textSplitter({ type: '@n8n/n8n-nodes-langchain.textSplitterRecursiveCharacterTextSplitter', version: 1, config: { name: 'Split Book Text', parameters: { chunkSize: 1200, chunkOverlap: 200, options: {} }, position: [1016, 760] } });
const load_Extracted_Book_Text = documentLoader({ type: '@n8n/n8n-nodes-langchain.documentDefaultDataLoader', version: 1.1, config: { name: 'Load Extracted Book Text', parameters: { jsonMode: 'expressionData', jsonData: expr('{{ $json.text }}'), textSplittingMode: 'custom', options: { metadata: { metadataValues: [{ name: 'source', value: 'uploaded-book' }] } } }, position: [936, 552], subnodes: { textSplitter: split_Book_Text } } });
const gemini_Answer_Model = languageModel({ type: '@n8n/n8n-nodes-langchain.lmChatGoogleGemini', version: 1.1, config: { name: 'Gemini Answer Model', parameters: { modelName: 'models/gemini-3.1-flash-lite', options: { maxOutputTokens: 180, temperature: 0 } }, credentials: { googlePalmApi: newCredential('Google Gemini(PaLM) Api account', 'm8KyJpE3ONt9L7xo') }, position: [360, 1288] } });
const gemini_Query_embeddings = embedding({ type: '@n8n/n8n-nodes-langchain.embeddingsGoogleGemini', version: 1, config: { name: 'Gemini Query embeddings', credentials: { googlePalmApi: newCredential('Google Gemini(PaLM) Api account', 'm8KyJpE3ONt9L7xo') }, position: [568, 1704] } });
const retrieve_Book_Context = vectorStore({ type: '@n8n/n8n-nodes-langchain.vectorStoreSupabase', version: 1.3, config: { name: 'Retrieve Book Context', parameters: { tableName: { __rl: true, mode: 'id', value: 'documents' }, options: { queryName: 'match_documents' } }, credentials: { supabaseApi: newCredential('Supabase n8n RAG', '6wlnjsT4hy3ApTwM') }, position: [488, 1496], subnodes: { embedding: gemini_Query_embeddings } } });
const find_Relevant_Book_Passages = retriever({ type: '@n8n/n8n-nodes-langchain.retrieverVectorStore', version: 1, config: { name: 'Find Relevant Book Passages', parameters: { topK: 6 }, position: [488, 1288], subnodes: { vectorStore: retrieve_Book_Context } } });

const upload_Book_Form = trigger({
  type: 'n8n-nodes-base.formTrigger',
  version: 2.6,
  config: { name: 'Upload Book Form', parameters: { formTitle: 'Upload The Book', formDescription: 'Upload one public English PDF of up to 20 MB.', formFields: { values: [{ fieldLabel: 'Book PDF', fieldType: 'file', fieldName: 'bookPdf', multipleFiles: false, acceptFileTypes: '.pdf,application/pdf', requiredField: true }] }, options: { appendAttribution: false, buttonLabel: 'Upload', path: 'upload-book-rag', respondWithOptions: { values: { formSubmittedText: '' } } } }, position: [128, 320], webhookId: 'e2651263-ed01-422d-8cf4-c87087a6b171' }
});

const validate_Book_Upload = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Validate Book Upload', parameters: { jsCode: 'const items = $input.all();\nconst state = $getWorkflowStaticData(\'global\');\nstate.bookReady = false;\n\nif (items.length !== 1) {\n  throw new Error(\'Exactly one PDF file is required.\');\n}\n\nconst file = items[0].binary?.bookPdf;\nif (!file) {\n  throw new Error(\'The required PDF file is missing.\');\n}\n\nconst mimeType = String(file.mimeType ?? \'\').toLowerCase();\nconst fileName = String(file.fileName ?? \'\').toLowerCase();\nif (mimeType !== \'application/pdf\' && !fileName.endsWith(\'.pdf\')) {\n  throw new Error(\'Only PDF files are accepted.\');\n}\n\nconst rawSize = file.fileSize;\nlet sizeBytes;\nif (typeof rawSize === \'number\') {\n  sizeBytes = rawSize;\n} else {\n  const match = String(rawSize ?? \'\').trim().match(/^([0-9]+(?:\\.[0-9]+)?)\\s*(b|kb|kib|mb|mib)?$/i);\n  if (!match) {\n    throw new Error(\'The PDF size could not be verified.\');\n  }\n  const value = Number(match[1]);\n  const unit = (match[2] ?? \'b\').toLowerCase();\n  const multipliers = { b: 1, kb: 1000, kib: 1024, mb: 1000000, mib: 1048576 };\n  sizeBytes = value * multipliers[unit];\n}\n\nif (sizeBytes > 20 * 1024 * 1024) {\n  throw new Error(\'The PDF exceeds the 20 MB limit.\');\n}\n\nreturn items;' }, position: [352, 320], notes: 'Validates that one PDF no larger than 20 MB was submitted and marks the shared book state unavailable before ingestion starts.', notesInFlow: true }
});

const extract_PDF_Text = node({
  type: 'n8n-nodes-base.extractFromFile',
  version: 1.1,
  config: { name: 'Extract PDF Text', parameters: { operation: 'pdf', binaryPropertyName: 'bookPdf', options: {} }, position: [576, 320] }
});

const store_Complete_Book = node({
  type: '@n8n/n8n-nodes-langchain.vectorStoreSupabase',
  version: 1.3,
  config: { name: 'Store Complete Book', parameters: { mode: 'insert', tableName: { __rl: true, mode: 'id', value: 'documents' }, options: { queryName: 'match_documents' } }, credentials: { supabaseApi: newCredential('Supabase n8n RAG', '6wlnjsT4hy3ApTwM') }, position: [832, 320], subnodes: { embedding: gemini_Document_embeddings, documentLoader: load_Extracted_Book_Text } }
});

const mark_Book_Ready = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Mark Book Ready', parameters: { jsCode: 'const state = $getWorkflowStaticData(\'global\');\nstate.bookReady = true;\nstate.bookReadyAt = new Date().toISOString();\nreturn $input.all();' }, position: [1296, 320], notes: 'Marks the book available only after the vector store insertion finishes successfully.', notesInFlow: true }
});

const ask_the_Book_Chat = trigger({
  type: '@n8n/n8n-nodes-langchain.chatTrigger',
  version: 1.4,
  config: { name: 'Ask the Book Chat', parameters: { public: true, initialMessages: 'Qui est le père de sundiata ?', options: { inputPlaceholder: 'Ask a question about the book...', loadPreviousSession: 'notSupported', showWelcomeScreen: true, getStarted: 'Ask The Book', subtitle: 'Answers are based only on the uploaded book.', title: 'Book RAG Chat', responseMode: 'responseNodes' } }, position: [128, 1072], webhookId: 'bdd7e121-fc6b-4ff3-80d3-4864cef55aab' }
});

const answer_from_Book_Only = node({
  type: '@n8n/n8n-nodes-langchain.chainRetrievalQa',
  version: 1.7,
  config: { name: 'Answer from Book Only', parameters: { promptType: 'define', text: expr('{{ $json.chatInput }}'), options: { systemPromptTemplate: 'You answer exclusively from the supplied book context. Use the same language as the user question. Keep the answer at or below 100 words. If the context does not contain the answer, clearly state in the question language that the information is not in the book. Never use outside knowledge, never guess, and never mention a factual answer that is absent from the context.\n\nBook context:\n{context}\n\nQuestion:\n{input}' } }, position: [384, 1072], onError: 'continueErrorOutput', subnodes: { model: gemini_Answer_Model, retriever: find_Relevant_Book_Passages } }
});

const enforce_Answer_Limit = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Enforce Answer Limit', parameters: { jsCode: 'return $input.all().map((item) => {\n  const json = { ...item.json };\n  const source = String(json.output ?? json.response ?? json.text ?? \'\');\n  const words = source.trim().split(/\\s+/).filter(Boolean);\n  const output = words.length > 100 ? words.slice(0, 100).join(\' \') : source;\n  return { json: { ...json, output }, pairedItem: item.pairedItem };\n});' }, position: [848, 1072], notes: 'Normalizes the chat response and enforces the specification limit of 100 words.', notesInFlow: true }
});

const chat = node({
  type: '@n8n/n8n-nodes-langchain.chat',
  version: 1.3,
  config: { name: 'Chat', parameters: { message: expr('{{ $json.response }}'), options: {} }, position: [1072, 1072], webhookId: '8977d0e0-af39-41c8-846a-f0916c30fd89' }
});

const wf = workflow('Sf6VPPLRkyp39UWN', 'Book RAG Chat', { description: 'Loads one English PDF into the n8n simple vector store and answers chat questions exclusively from that book with Gemini.', availableInMCP: true, executionOrder: 'v1', binaryMode: 'separate', timeSavedMode: 'fixed', errorWorkflow: 'S4RuxvMxcz0wCYj7', timezone: 'Europe/Paris', callerPolicy: 'workflowsFromSameOwner' });

export default wf
  .add(upload_Book_Form)
  .to(validate_Book_Upload)
  .to(extract_PDF_Text)
  .to(store_Complete_Book)
  .to(mark_Book_Ready)
  .add(ask_the_Book_Chat)
  .to(answer_from_Book_Only)
  .to(enforce_Answer_Limit)
  .to(chat)