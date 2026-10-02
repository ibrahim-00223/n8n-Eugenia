const recursive_Character_Text_Splitter = textSplitter({ type: '@n8n/n8n-nodes-langchain.textSplitterRecursiveCharacterTextSplitter', version: 1, config: { name: 'Recursive Character Text Splitter', parameters: { chunkSize: 10000, options: {} }, position: [1464, 664] } });
const default_Data_Loader = documentLoader({ type: '@n8n/n8n-nodes-langchain.documentDefaultDataLoader', version: 1.1, config: { name: 'Default Data Loader', parameters: { jsonMode: 'expressionData', jsonData: expr('{{ $json.enrichedText }}'), textSplittingMode: 'custom', options: { metadata: { metadataValues: [{ name: 'text', value: expr('{{ $(\'Build Enriched Chunk\').item.json.text }}') }, { name: 'context', value: expr('{{ $(\'Build Enriched Chunk\').item.json.context }}') }, { name: 'hypothetical_questions', value: expr('{{ $(\'Build Enriched Chunk\').item.json.hypothetical_questions }}') }, { name: 'keywords', value: expr('{{ $(\'Build Enriched Chunk\').item.json.keywords }}') }, { name: 'entities', value: expr('{{ $(\'Build Enriched Chunk\').item.json.entities }}') }, { name: 'relationships', value: expr('{{ $(\'Build Enriched Chunk\').item.json.relationships }}') }] } } }, position: [1384, 456], subnodes: { textSplitter: recursive_Character_Text_Splitter } } });
const embeddings_Google_Gemini = embedding({ type: '@n8n/n8n-nodes-langchain.embeddingsGoogleGemini', version: 1, config: { credentials: { googlePalmApi: newCredential('Google Gemini(PaLM) Api account', 'm8KyJpE3ONt9L7xo') }, position: [1256, 456] } });
const embeddings_Google_Gemini1 = embedding({ type: '@n8n/n8n-nodes-langchain.embeddingsGoogleGemini', version: 1, config: { name: 'Embeddings Google Gemini1', credentials: { googlePalmApi: newCredential('Google Gemini(PaLM) Api account', 'm8KyJpE3ONt9L7xo') }, position: [872, 1192] } });

const on_form_submission = trigger({
  type: 'n8n-nodes-base.formTrigger',
  version: 2.6,
  config: { name: 'On form submission', parameters: { formTitle: 'RAG', formFields: { values: [{ fieldLabel: 'data', fieldType: 'file' }] }, options: {} }, webhookId: '2f441a20-02be-4dfb-8f7c-bf3e9a4a7c7c' }
});

const extract_from_File = node({
  type: 'n8n-nodes-base.extractFromFile',
  version: 1.1,
  config: { name: 'Extract from File', parameters: { operation: 'pdf', options: {} }, position: [224, 0] }
});

const nettoyage = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Nettoyage', parameters: { jsCode: 'const items = $input.all();\n\nreturn items.map(item => {\n  let text = item.json.text || "";\n\n  text = text\n    // Normaliser les retours à la ligne Windows / anciens Mac\n    .replace(/\\r\\n?/g, "\\n")\n\n    // Supprimer certains caractères de contrôle invisibles\n    .replace(/[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F]/g, "")\n\n    // Supprimer les espaces et tabs répétés\n    .replace(/[ \\t]+/g, " ")\n\n    // Nettoyer les espaces avant les retours à la ligne\n    .replace(/[ \\t]+\\n/g, "\\n")\n\n    // Éviter 4, 5, 6 lignes vides successives\n    // mais conserver les doubles retours utiles pour les paragraphes\n    .replace(/\\n{3,}/g, "\\n\\n")\n\n    // Supprimer les URLs isolées sur une ligne\n    .replace(/^\\s*https?:\\/\\/\\S+\\s*$/gm, "")\n\n    // Nettoyage final\n    .trim();\n\n  return {\n    json: {\n      ...item.json,\n      text\n    }\n  };\n});' }, position: [448, 0] }
});

const structure_as_Markdown = node({
  type: '@n8n/n8n-nodes-langchain.googleGemini',
  version: 1.2,
  config: { name: 'Structure as Markdown', parameters: { modelId: { __rl: true, value: 'models/gemini-flash-latest', mode: 'list', cachedResultName: 'models/gemini-flash-latest' }, messages: { values: [{ content: expr('You are a document formatting assistant.\n\nYour task is to convert the following cleaned book text into well-structured Markdown.\n\nRules:\n- Preserve the original wording exactly as much as possible.\n- Do NOT summarize.\n- Do NOT rewrite or paraphrase.\n- Do NOT invent information.\n- Preserve all paragraphs.\n- Detect and format chapter titles using Markdown headings.\n- Detect and format section titles using Markdown subheadings.\n- Preserve lists when present.\n- Preserve paragraph breaks.\n- Do not add explanations or comments.\n- Output Markdown only.\n\nText:\n\n{{ $json.text }}') }] }, builtInTools: {}, options: {} }, credentials: { googlePalmApi: newCredential('Google Gemini(PaLM) Api account', 'm8KyJpE3ONt9L7xo') }, position: [672, 0] }
});

const chunking = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Chunking', parameters: { jsCode: 'const CHUNK_SIZE = 3000;\nconst OVERLAP = 300;\n\nconst SEPARATORS = [\n  "\\n# ",\n  "\\n## ",\n  "\\n### ",\n  "\\n\\n",\n  "\\n",\n  ". ",\n  " ",\n  ""\n];\n\nconst items = $input.all();\nconst output = [];\n\nfunction splitRecursively(text, separators, chunkSize) {\n  if (text.length <= chunkSize) {\n    return [text.trim()];\n  }\n\n  const separator = separators[0];\n\n  // Dernier recours : découpage brut par caractères\n  if (separator === "") {\n    const chunks = [];\n\n    for (let i = 0; i < text.length; i += chunkSize) {\n      chunks.push(\n        text.slice(i, i + chunkSize).trim()\n      );\n    }\n\n    return chunks;\n  }\n\n  const parts = text.split(separator);\n\n  // Si ce séparateur ne permet pas de découper,\n  // on passe au suivant\n  if (parts.length === 1) {\n    return splitRecursively(\n      text,\n      separators.slice(1),\n      chunkSize\n    );\n  }\n\n  const chunks = [];\n  let currentChunk = "";\n\n  for (let i = 0; i < parts.length; i++) {\n\n    const part =\n      i === 0\n        ? parts[i]\n        : separator + parts[i];\n\n    if ((currentChunk + part).length <= chunkSize) {\n      currentChunk += part;\n    }\n\n    else {\n\n      if (currentChunk.trim()) {\n        chunks.push(currentChunk.trim());\n      }\n\n      // Si le bloc est toujours trop grand,\n      // on continue récursivement\n      if (part.length > chunkSize) {\n\n        const subChunks = splitRecursively(\n          part,\n          separators.slice(1),\n          chunkSize\n        );\n\n        chunks.push(...subChunks.slice(0, -1));\n\n        currentChunk =\n          subChunks[subChunks.length - 1] || "";\n\n      } else {\n\n        currentChunk = part;\n      }\n    }\n  }\n\n  if (currentChunk.trim()) {\n    chunks.push(currentChunk.trim());\n  }\n\n  return chunks;\n}\n\n\n// Ajout de l\'overlap\nfunction addOverlap(chunks, overlap) {\n\n  if (overlap <= 0 || chunks.length <= 1) {\n    return chunks;\n  }\n\n  return chunks.map((chunk, index) => {\n\n    if (index === 0) {\n      return chunk;\n    }\n\n    const previousChunk =\n      chunks[index - 1];\n\n    let overlapText =\n      previousChunk.slice(-overlap);\n\n    // Éviter de commencer au milieu d\'un mot\n    const firstSpace =\n      overlapText.indexOf(" ");\n\n    if (firstSpace !== -1) {\n      overlapText =\n        overlapText.slice(firstSpace + 1);\n    }\n\n    return (\n      overlapText +\n      "\\n\\n" +\n      chunk\n    ).trim();\n\n  });\n}\n\n\nfor (const item of items) {\n\n  // Récupération adaptée à ton input Gemini\n  const text =\n    item.json.content?.parts?.[0]?.text || "";\n\n  if (!text.trim()) {\n    continue;\n  }\n\n  // Recursive splitting\n  let chunks = splitRecursively(\n    text,\n    SEPARATORS,\n    CHUNK_SIZE\n  );\n\n  // Ajout de l\'overlap\n  chunks = addOverlap(\n    chunks,\n    OVERLAP\n  );\n\n  // Création d\'un item n8n par chunk\n  chunks.forEach((chunk, index) => {\n\n    output.push({\n      json: {\n        chunkIndex: index,\n        chunkSize: chunk.length,\n        text: chunk\n      }\n    });\n\n  });\n}\n\nreturn output;' }, position: [1024, 0] }
});

const call_RAG_Augmented = node({
  type: 'n8n-nodes-base.executeWorkflow',
  version: 1.4,
  config: { name: 'Call \'RAG Augmented\'', parameters: { workflowId: { __rl: true, value: 'eUdzlaeVsB1K98fN', mode: 'list', cachedResultUrl: '/workflow/eUdzlaeVsB1K98fN', cachedResultName: 'RAG Augmented' }, workflowInputs: { mappingMode: 'defineBelow', value: { text: expr('{{ $json.text }}') }, matchingColumns: ['text'], schema: [{ id: 'text', displayName: 'text', required: false, defaultMatch: false, display: true, canBeUsedToMatch: true, type: 'string', removed: false }], attemptToConvertTypes: false, convertFieldsToString: true }, mode: 'each', options: {} }, position: [1248, 0] }
});

const when_Executed_by_Another_Workflow = trigger({
  type: 'n8n-nodes-base.executeWorkflowTrigger',
  version: 1.2,
  config: { name: 'When Executed by Another Workflow', parameters: { workflowInputs: { values: [{ name: 'text' }] } }, position: [0, 432] }
});

const augment_Chunk = node({
  type: '@n8n/n8n-nodes-langchain.googleGemini',
  version: 1.2,
  config: { name: 'Augment Chunk', parameters: { modelId: { __rl: true, mode: 'list', value: 'models/gemini-3-flash-preview' }, messages: { values: [{ content: expr('You are enriching a chunk of a book for a Retrieval-Augmented Generation system.\n\nAnalyze the chunk below and return ONLY valid JSON.\n\nYour task is to generate:\n\n1. context:\nA short description of what this chunk is about and where it fits conceptually.\n\n2. hypothetical_questions:\nGenerate 3 to 5 questions that a user could ask and that this chunk could help answer.\n\n3. keywords:\nExtract 5 to 10 important keywords or concepts from the chunk.\n\n4. entities:\nExtract the main named entities mentioned in the chunk, such as:\n- people\n- places\n- organizations\n- historical figures\n- groups\n\n5. relationships:\nExtract the main relationships between entities when they are clearly supported by the text.\n\nDo not invent information.\nDo not use external knowledge.\nOnly use the content of the chunk.\n\nReturn exactly this JSON structure:\n\n{\n  "context": "",\n  "hypothetical_questions": [],\n  "keywords": [],\n  "entities": [],\n  "relationships": []\n}\n\nCHUNK:\n\n{{ $json.text }}') }] }, jsonOutput: expr('{{ true }}'), builtInTools: {}, options: {} }, credentials: { googlePalmApi: newCredential('Google Gemini(PaLM) Api account', 'm8KyJpE3ONt9L7xo') }, position: [224, 432] }
});

const parse_Augmentation_JSON = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Parse Augmentation JSON', parameters: { jsCode: 'const items = $input.all();\n\nfunction extractFirstJsonObject(raw) {\n  const start = raw.indexOf("{");\n\n  if (start === -1) {\n    throw new Error("Aucun objet JSON trouvé.");\n  }\n\n  let depth = 0;\n  let inString = false;\n  let escaped = false;\n\n  for (let i = start; i < raw.length; i++) {\n    const char = raw[i];\n\n    if (escaped) {\n      escaped = false;\n      continue;\n    }\n\n    if (char === "\\\\") {\n      escaped = true;\n      continue;\n    }\n\n    if (char === \'"\') {\n      inString = !inString;\n      continue;\n    }\n\n    if (!inString) {\n      if (char === "{") {\n        depth++;\n      }\n\n      if (char === "}") {\n        depth--;\n\n        if (depth === 0) {\n          return raw.slice(start, i + 1);\n        }\n      }\n    }\n  }\n\n  throw new Error("Objet JSON incomplet.");\n}\n\nreturn items.map(item => {\n  let raw = item.json.content?.parts?.[0]?.text || "";\n\n  if (!raw) {\n    throw new Error(\n      "Aucune réponse trouvée dans content.parts[0].text"\n    );\n  }\n\n  raw = raw\n    .replace(/```json/gi, "")\n    .replace(/```/g, "")\n    .trim();\n\n  const jsonString = extractFirstJsonObject(raw);\n\n  try {\n    const parsed = JSON.parse(jsonString);\n\n    return {\n      json: parsed\n    };\n  } catch (error) {\n    throw new Error(\n      `JSON invalide : ${error.message}\\n\\nJSON extrait :\\n${jsonString}`\n    );\n  }\n});' }, position: [576, 432] }
});

const merge_Context = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Merge Context', parameters: { jsCode: 'const augmentation = $input.first().json;\n\nconst originalChunk = $(\'When Executed by Another Workflow\').first().json;\n\nreturn [\n  {\n    json: {\n      chunkIndex: originalChunk.chunkIndex,\n      text: originalChunk.text,\n\n      context: augmentation.context,\n      hypothetical_questions: augmentation.hypothetical_questions,\n      keywords: augmentation.keywords,\n      entities: augmentation.entities,\n      relationships: augmentation.relationships\n    }\n  }\n];' }, position: [800, 432] }
});

const build_Enriched_Chunk = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Build Enriched Chunk', parameters: { jsCode: 'const item = $input.first().json;\n\nconst questions = (item.hypothetical_questions || [])\n  .map(q => `- ${q}`)\n  .join("\\n");\n\nconst relationships = (item.relationships || [])\n  .map(r => `- ${r.subject} ${r.predicate} ${r.object}`)\n  .join("\\n");\n\nconst enrichedText = `\nCONTEXT:\n${item.context || ""}\n\nHYPOTHETICAL QUESTIONS:\n${questions}\n\nKEYWORDS:\n${(item.keywords || []).join(", ")}\n\nENTITIES:\n${(item.entities || []).join(", ")}\n\nRELATIONSHIPS:\n${relationships}\n\nORIGINAL CHUNK:\n${item.text || ""}\n`.trim();\n\nreturn [\n  {\n    json: {\n      ...item,\n      enrichedText\n    }\n  }\n];' }, position: [1024, 432] }
});

const vectorisation = node({
  type: '@n8n/n8n-nodes-langchain.vectorStoreSupabase',
  version: 1.3,
  config: { name: 'Vectorisation', parameters: { mode: 'insert', tableName: { __rl: true, value: 'documents', mode: 'list', cachedResultName: 'documents' }, options: {} }, credentials: { supabaseApi: newCredential('Supabase n8n RAG', '6wlnjsT4hy3ApTwM') }, position: [1280, 224], subnodes: { documentLoader: default_Data_Loader, embedding: embeddings_Google_Gemini } }
});

const when_chat_message_received = trigger({
  type: '@n8n/n8n-nodes-langchain.chatTrigger',
  version: 1.5,
  config: { name: 'When chat message received', parameters: { options: { responseMode: 'responseNodes' } }, position: [0, 976], webhookId: '7c2694ef-dcd0-47a5-a9ff-3683c7a0d8de' }
});

const query_Augmentation = node({
  type: '@n8n/n8n-nodes-langchain.googleGemini',
  version: 1.2,
  config: { name: 'Query Augmentation', parameters: { modelId: { __rl: true, mode: 'list', value: 'models/gemini-3-flash-preview' }, messages: { values: [{ content: expr('You are a query expansion assistant for a RAG system.\n\nYour task is to reformulate the user\'s question into 3 alternative search queries.\n\nRules:\n- Do NOT answer the question.\n- Preserve the original intent.\n- Use different wording and relevant synonyms.\n- Keep each query concise.\n- Return only valid JSON.\n- Do not add any text before or after the JSON.\n\nReturn exactly:\n\n{\n  "queries": [\n    "...",\n    "...",\n    "..."\n  ]\n}\n\nUser question:\n{{ $json.chatInput }}') }] }, jsonOutput: true, builtInTools: {}, options: {} }, credentials: { googlePalmApi: newCredential('Google Gemini(PaLM) Api account', 'm8KyJpE3ONt9L7xo') }, position: [224, 976] }
});

const parse_Response = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Parse Response', parameters: { jsCode: 'const raw = $json.content?.parts?.[0]?.text || "";\n\nif (!raw) {\n  throw new Error("Aucune réponse Gemini trouvée.");\n}\n\n// Nettoyage éventuel des ```json\nconst cleaned = raw\n  .replace(/```json/gi, "")\n  .replace(/```/g, "")\n  .trim();\n\nlet parsed;\n\ntry {\n  parsed = JSON.parse(cleaned);\n} catch (error) {\n  throw new Error(\n    `JSON invalide : ${error.message}\\n\\nRéponse reçue :\\n${cleaned}`\n  );\n}\n\nif (!Array.isArray(parsed.queries)) {\n  throw new Error("Le champ \'queries\' est absent ou n\'est pas un tableau.");\n}\n\nreturn parsed.queries.map((query, index) => ({\n  json: {\n    queryIndex: index,\n    query\n  }\n}));' }, position: [576, 976] }
});

const vector_Search = node({
  type: '@n8n/n8n-nodes-langchain.vectorStoreSupabase',
  version: 1.3,
  config: { name: 'Vector Search', parameters: { mode: 'load', tableName: { __rl: true, value: 'documents', mode: 'list', cachedResultName: 'documents' }, prompt: expr('{{ $json.query }}'), topK: 10, includeDocumentMetadata: false, options: {} }, credentials: { supabaseApi: newCredential('Supabase n8n RAG', '6wlnjsT4hy3ApTwM') }, position: [800, 976], subnodes: { embedding: embeddings_Google_Gemini1 } }
});

const deduplicate_Results = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Deduplicate Results', parameters: { jsCode: 'const items = $input.all();\n\nconst map = new Map();\n\nfor (const item of items) {\n  const content = item.json.document?.pageContent || "";\n  const score = item.json.score || 0;\n\n  if (!content) continue;\n\n  if (!map.has(content) || score > map.get(content).score) {\n    map.set(content, {\n      document: item.json.document,\n      score\n    });\n  }\n}\n\nreturn Array.from(map.values())\n  .sort((a, b) => b.score - a.score)\n  .map(item => ({\n    json: item\n  }));' }, position: [1152, 976] }
});

const merge_Responses = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Merge Responses', parameters: { jsCode: 'const items = $input.all();\n\nconst candidates = items.map((item, index) => ({\n  id: index + 1,\n  vectorScore: item.json.score ?? null,\n  content: item.json.document?.pageContent || ""\n}));\n\nreturn [\n  {\n    json: {\n      candidates\n    }\n  }\n];' }, position: [1376, 976] }
});

const reranking = node({
  type: '@n8n/n8n-nodes-langchain.googleGemini',
  version: 1.2,
  config: { name: 'Reranking', parameters: { modelId: { __rl: true, value: 'models/gemini-flash-lite-latest', mode: 'list', cachedResultName: 'models/gemini-flash-lite-latest' }, messages: { values: [{ content: expr('You are a reranking assistant for a RAG system.\n\nYour task is to rank the candidate documents below by relevance to the user\'s original question.\n\nRules:\n- Do NOT answer the user\'s question.\n- Only evaluate document relevance.\n- Compare all candidate documents together.\n- Focus primarily on whether the document content can directly help answer the original question.\n- Use the vectorScore only as a secondary signal.\n- Do not simply preserve the vector ranking.\n- Return only the 3 most relevant documents.\n- Use the existing candidate "id" values exactly as provided.\n- Return only valid JSON.\n- Do not use markdown code fences.\n- Do not add any explanation before or after the JSON.\n\nOriginal question:\n{{ $(\'When chat message received\').first().json.chatInput }}\n\nCandidate documents:\n{{ JSON.stringify($json.candidates) }}\n\nReturn exactly this structure:\n\n{\n  "top_documents": [\n    {\n      "id": 1,\n      "relevance_score": 0.95\n    },\n    {\n      "id": 2,\n      "relevance_score": 0.90\n    },\n    {\n      "id": 3,\n      "relevance_score": 0.85\n    }\n  ]\n}') }] }, builtInTools: {}, options: { temperature: 0 } }, credentials: { googlePalmApi: newCredential('Google Gemini(PaLM) Api account', 'm8KyJpE3ONt9L7xo') }, position: [1600, 976] }
});

const select_Reranked_Documents = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Select Reranked Documents', parameters: { jsCode: 'const raw = $json.content?.parts?.[0]?.text || "";\n\nif (!raw) {\n  throw new Error("Aucune réponse du reranker trouvée.");\n}\n\nconst cleaned = raw\n  .replace(/```json/gi, "")\n  .replace(/```/g, "")\n  .trim();\n\nlet parsed;\n\ntry {\n  parsed = JSON.parse(cleaned);\n} catch (error) {\n  throw new Error(\n    `JSON invalide : ${error.message}\\n\\nRéponse reçue :\\n${cleaned}`\n  );\n}\n\nconst candidates =\n  $(\'Merge Responses\').first().json.candidates || [];\n\nconst selectedDocuments = (parsed.top_documents || [])\n  .map(result => {\n    const candidate = candidates.find(\n      c => c.id === result.id\n    );\n\n    if (!candidate) return null;\n\n    return {\n      id: result.id,\n      relevance_score: result.relevance_score,\n      vectorScore: candidate.vectorScore,\n      content: candidate.content\n    };\n  })\n  .filter(Boolean);\n\nreturn [\n  {\n    json: {\n      selectedDocuments\n    }\n  }\n];' }, position: [1952, 976] }
});

const lLM_Answering = node({
  type: '@n8n/n8n-nodes-langchain.googleGemini',
  version: 1.2,
  config: { name: 'LLM Answering', parameters: { modelId: { __rl: true, value: 'models/gemini-flash-lite-latest', mode: 'list', cachedResultName: 'models/gemini-flash-lite-latest' }, messages: { values: [{ content: expr('You are a RAG answering assistant.\n\nAnswer the user\'s question using only the retrieved context below.\n\nRules:\n- Answer in the same language as the user.\n- Use only information supported by the retrieved documents.\n- Do not invent facts.\n- If the context is insufficient, say that the available documents do not contain enough information.\n- Be concise but complete.\n- Do not mention vector scores, reranking, embeddings, chunks, or the retrieval process.\n\nUser question:\n{{ $(\'When chat message received\').first().json.chatInput }}\n\nRetrieved context:\n{{ $json.selectedDocuments.map((doc, index) => `\nDOCUMENT ${index + 1}\n\n${doc.content}\n`).join("\\n\\n") }}') }] }, builtInTools: {}, options: { temperature: 0 } }, credentials: { googlePalmApi: newCredential('Google Gemini(PaLM) Api account', 'm8KyJpE3ONt9L7xo') }, position: [2176, 976] }
});

const chat = node({
  type: '@n8n/n8n-nodes-langchain.chat',
  version: 1.3,
  config: { name: 'Chat', parameters: { message: expr('{{ $json.content.parts[0].text }}'), options: {} }, position: [2528, 976], webhookId: '514b1c02-44c2-4d9d-9029-bad2e5daacc1' }
});

const wf = workflow('eUdzlaeVsB1K98fN', 'RAG Augmented', { description: 'Loads one English PDF into the n8n simple vector store and answers chat questions exclusively from that book with Gemini.', availableInMCP: true, executionOrder: 'v1', binaryMode: 'separate', timeSavedMode: 'fixed', errorWorkflow: 'S4RuxvMxcz0wCYj7', timezone: 'Europe/Paris', callerPolicy: 'workflowsFromSameOwner' });

export default wf
  .add(on_form_submission)
  .to(extract_from_File)
  .to(nettoyage)
  .to(structure_as_Markdown)
  .to(chunking)
  .to(call_RAG_Augmented)
  .add(when_Executed_by_Another_Workflow)
  .to(augment_Chunk)
  .to(parse_Augmentation_JSON)
  .to(merge_Context)
  .to(build_Enriched_Chunk)
  .to(vectorisation)
  .add(when_chat_message_received)
  .to(query_Augmentation)
  .to(parse_Response)
  .to(vector_Search)
  .to(deduplicate_Results)
  .to(merge_Responses)
  .to(reranking)
  .to(select_Reranked_Documents)
  .to(lLM_Answering)
  .to(chat)