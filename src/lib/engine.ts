import {
  Workflow,
  WorkflowNode,
  WorkflowEdge,
  NodeExecutionResult,
  WorkflowExecutionResult,
  ExecutionLog,
  NodeType,
  NodeExecutionState,
  InputNodeData,
  LLMTaskNodeData,
  WebScraperNodeData,
  StructuredOutputNodeData,
  EmbeddingGeneratorNodeData,
  SimilaritySearchNodeData,
  TextToSpeechNodeData,
  TextToImageNodeData,
  ImageToVideoNodeData,
  TextExportNodeData,
  ExportFormat,
} from "@/types/workflow";
import { groupNodesByDepth } from "./validator";
import { createCsvDataUrl, createTranscriptSummaryPdfDataUrl } from "./export";

/**
 * Main execution engine for workflows
 */
export class WorkflowEngine {
  private workflow: Workflow;
  private nodeOutputs: Map<string, any>;
  private logs: ExecutionLog[];
  private abortController: AbortController;
  private onStateChange?: (nodeId: string, state: NodeExecutionState) => void;
  private onLog?: (log: ExecutionLog) => void;
  private baseUrl: string;

  constructor(
    workflow: Workflow,
    callbacks?: {
      onStateChange?: (nodeId: string, state: NodeExecutionState) => void;
      onLog?: (log: ExecutionLog) => void;
      baseUrl?: string;
    }
  ) {
    this.workflow = workflow;
    this.nodeOutputs = new Map();
    this.logs = [];
    this.abortController = new AbortController();
    this.onStateChange = callbacks?.onStateChange;
    this.onLog = callbacks?.onLog;
    // Use provided baseUrl or detect from environment
    this.baseUrl = callbacks?.baseUrl || this.getBaseUrl();
  }

  /**
   * Get base URL for API calls
   */
  private getBaseUrl(): string {
    // In browser context
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    // In server context, use environment variable or default
    return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  }

  /**
   * Execute the workflow using DAG-based parallel execution
   */
  async execute(): Promise<WorkflowExecutionResult> {
    this.log("info", "Starting workflow execution");

    try {
      // Group nodes by depth for parallel execution
      const depthGroups = groupNodesByDepth(
        this.workflow.nodes,
        this.workflow.edges
      );

      this.log(
        "info",
        `Workflow has ${depthGroups.length} execution levels`
      );

      const results: Record<string, NodeExecutionResult> = {};

      // Execute each depth level
      for (let i = 0; i < depthGroups.length; i++) {
        if (this.abortController.signal.aborted) {
          this.log("warning", "Workflow execution cancelled");
          throw new Error("Execution cancelled");
        }

        const level = depthGroups[i];
        this.log(
          "info",
          `Executing level ${i + 1} with ${level.length} node(s): ${level.map((n) => n.id).join(", ")}`
        );

        // Execute all nodes in this level in parallel
        const levelResults = await Promise.all(
          level.map((node) => this.executeNode(node))
        );

        // Store results
        levelResults.forEach((result) => {
          results[result.nodeId] = result;
          if (result.success) {
            this.nodeOutputs.set(result.nodeId, result.output);
          }
        });

        // Check if any node failed
        const failed = levelResults.filter((r) => !r.success);
        if (failed.length > 0) {
          this.log(
            "error",
            `${failed.length} node(s) failed at level ${i + 1}`
          );
          throw new Error(
            `Nodes failed: ${failed.map((r) => r.nodeId).join(", ")}`
          );
        }
      }

      this.log("success", "Workflow execution completed successfully");

      return {
        success: true,
        results,
        logs: this.logs,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.log("error", `Workflow execution failed: ${errorMessage}`);

      return {
        success: false,
        results: {},
        logs: this.logs,
        error: errorMessage,
      };
    }
  }

  /**
   * Execute a single node
   */
  private async executeNode(node: WorkflowNode): Promise<NodeExecutionResult> {
    const startTime = Date.now();

    try {
      this.updateNodeState(node.id, NodeExecutionState.RUNNING);
      this.log("info", `Executing node: ${node.id} (${node.type})`, node.id);

      // Get input from connected nodes
      const input = this.getNodeInput(node.id);

      let output: any;

      switch (node.type) {
        case NodeType.INPUT:
          output = await this.executeInputNode(node);
          break;
        case NodeType.LLM_TASK:
          output = await this.executeLLMTaskNode(node, input);
          break;
        case NodeType.WEB_SCRAPER:
          output = await this.executeWebScraperNode(node);
          break;
        case NodeType.STRUCTURED_OUTPUT:
          output = await this.executeStructuredOutputNode(node, input);
          break;
        case NodeType.EMBEDDING_GENERATOR:
          output = await this.executeEmbeddingNode(node, input);
          break;
        case NodeType.SIMILARITY_SEARCH:
          output = await this.executeSimilaritySearchNode(node, input);
          break;
        case NodeType.TEXT_TO_SPEECH:
          output = await this.executeTextToSpeechNode(node, input);
          break;
        case NodeType.TEXT_TO_IMAGE:
          output = await this.executeTextToImageNode(node, input);
          break;
        case NodeType.IMAGE_TO_VIDEO:
          output = await this.executeImageToVideoNode(node, input);
          break;
        case NodeType.TEXT_EXPORT:
          output = await this.executeTextExportNode(node, input);
          break;
        case NodeType.OUTPUT:
          output = await this.executeOutputNode(node, input);
          break;
        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }

      const executionTime = Date.now() - startTime;
      this.updateNodeState(node.id, NodeExecutionState.SUCCESS);
      this.log(
        "success",
        `Node ${node.id} completed in ${executionTime}ms`,
        node.id
      );

      return {
        nodeId: node.id,
        success: true,
        output,
        executionTime,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.updateNodeState(node.id, NodeExecutionState.ERROR);
      this.log("error", `Node ${node.id} failed: ${errorMessage}`, node.id);

      return {
        nodeId: node.id,
        success: false,
        error: errorMessage,
        executionTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Execute Input Node
   */
  private async executeInputNode(node: WorkflowNode): Promise<any> {
    const nodeData = node.data as InputNodeData;
    const payload = nodeData.payload || nodeData.output;
    
    if (!payload) {
      return { data: "" };
    }

    // Try to parse as JSON, otherwise return as string
    try {
      return { data: JSON.parse(payload) };
    } catch {
      return { data: payload };
    }
  }

  /**
   * Execute LLM Task Node
   */
  private async executeLLMTaskNode(
    node: WorkflowNode,
    input: any
  ): Promise<any> {
    const nodeData = node.data as LLMTaskNodeData;
    const prompt = this.interpolateInput(nodeData.prompt || "", input);
    const model = nodeData.model || "openai/gpt-3.5-turbo";
    const temperature = nodeData.temperature || 0.7;
    const max_tokens = nodeData.max_tokens || 1000;

    try {
      const response = await fetch(`${this.baseUrl}/api/llm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, model, temperature, max_tokens }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "LLM task failed");
      }

      return result.data;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("LLM task was cancelled");
      }
      throw new Error(
        `Network error calling LLM API: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Execute Web Scraper Node
   */
  private async executeWebScraperNode(node: WorkflowNode): Promise<any> {
    const nodeData = node.data as WebScraperNodeData;
    const url = nodeData.url;
    const max_length = nodeData.max_length || 5000;

    if (!url) {
      throw new Error("URL is required for web scraper");
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/scrape`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, max_length }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Web scraping failed");
      }

      return result.data;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Web scraping was cancelled");
      }
      throw new Error(
        `Network error calling scrape API: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Execute Structured Output Node
   */
  private async executeStructuredOutputNode(
    node: WorkflowNode,
    input: any
  ): Promise<any> {
    const nodeData = node.data as StructuredOutputNodeData;
    const schemaStr = nodeData.schema;
    const model = nodeData.model || "openai/gpt-3.5-turbo";

    if (!schemaStr) {
      throw new Error("Schema is required for structured output");
    }

    let schema;
    try {
      schema = JSON.parse(schemaStr);
    } catch {
      throw new Error("Invalid JSON schema");
    }

    // Extract text from input
    const text = this.extractTextFromInput(input);

    try {
      const response = await fetch(`${this.baseUrl}/api/structured-extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, schema, model }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Structured extraction failed");
      }

      return result.data;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Structured extraction was cancelled");
      }
      throw new Error(
        `Network error calling structured extract API: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Execute Embedding Generator Node
   */
  private async executeEmbeddingNode(
    node: WorkflowNode,
    input: any
  ): Promise<any> {
    const nodeData = node.data as EmbeddingGeneratorNodeData;
    const model = nodeData.model || "embed-english-v3.0";
    const inputType = nodeData.inputType || "search_document";

    // Use custom text if provided, otherwise extract from input
    const text = nodeData.text || this.extractTextFromInput(input);

    if (!text) {
      throw new Error("No text available for embedding generation");
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/embedding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, model, inputType }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Embedding generation failed");
      }

      return {
        ...result.data,
        vector: result.data.embeddings[0], // Extract first embedding for convenience
      };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Embedding generation was cancelled");
      }
      throw new Error(
        `Network error calling embedding API: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Execute Similarity Search Node
   */
  private async executeSimilaritySearchNode(
    node: WorkflowNode,
    input: any
  ): Promise<any> {
    const nodeData = node.data as SimilaritySearchNodeData;
    const collectionName = nodeData.collectionName;
    const topK = nodeData.topK || 5;
    const scoreThreshold = nodeData.scoreThreshold || 0.7;

    if (!collectionName) {
      throw new Error("Collection name is required for similarity search");
    }

    // Determine if we have a vector or text query
    let vector = null;
    let queryText = nodeData.queryText || null;

    // Try to extract vector from input
    if (input) {
      if (Array.isArray(input)) {
        // Input is directly a vector
        vector = input;
      } else if (input.vector) {
        // Input has a vector field
        vector = input.vector;
      } else if (input.embeddings && Array.isArray(input.embeddings)) {
        // Input has embeddings array
        vector = input.embeddings[0];
      }
    }

    // If no vector and no queryText, try to extract text from input
    if (!vector && !queryText) {
      queryText = this.extractTextFromInput(input);
      if (!queryText) {
        throw new Error(
          "No vector or query text available for similarity search"
        );
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/similarity-search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collectionName,
          vector,
          queryText,
          topK,
          scoreThreshold,
        }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Similarity search failed");
      }

      return result.data;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Similarity search was cancelled");
      }
      throw new Error(
        `Network error calling similarity search API: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Execute Text to Speech Node
   */
  private async executeTextToSpeechNode(
    node: WorkflowNode,
    input: any
  ): Promise<any> {
    const nodeData = node.data as TextToSpeechNodeData;
    // Always interpolate the text to resolve template variables
    const text = this.interpolateInput(nodeData.text || "", input);

    if (!text) {
      throw new Error("Text is required for text-to-speech");
    }

    const voiceId = nodeData.voiceId || "JBFqnCBsd6RMkjVDRZzb";

    try {
      const response = await fetch(`${this.baseUrl}/api/text-speech`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceId }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Text-to-speech failed");
      }

      // Convert audio buffer to base64
      const audioBuffer = await response.arrayBuffer();
      const base64Audio = `data:audio/mpeg;base64,${Buffer.from(audioBuffer).toString('base64')}`;

      return { audioBase64: base64Audio, text };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Text-to-speech error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Execute Text to Image Node
   */
  private async executeTextToImageNode(
    node: WorkflowNode,
    input: any
  ): Promise<any> {
    const nodeData = node.data as TextToImageNodeData;
    // Always interpolate the prompt to resolve template variables
    const prompt = this.interpolateInput(nodeData.prompt || "", input);

    if (!prompt) {
      throw new Error("Prompt is required for text-to-image");
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/text-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Text-to-image failed");
      }

      // Convert image buffer to base64
      const imageBuffer = await response.arrayBuffer();
      const base64Image = `data:image/jpeg;base64,${Buffer.from(imageBuffer).toString('base64')}`;

      return { imageBase64: base64Image, prompt };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Text-to-image error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Execute Image to Video Node
   */
  private async executeImageToVideoNode(
    node: WorkflowNode,
    input: any
  ): Promise<any> {
    const nodeData = node.data as ImageToVideoNodeData;
    let images: string[] = nodeData.images || [];
    let audioBase64 = nodeData.audioBase64;

    // Handle multiple inputs from different nodes (Record format)
    if (input && typeof input === 'object' && !Array.isArray(input)) {
      // Check if it's a Record of node outputs (multiple connections)
      const entries = Object.entries(input);
      
      // If we have multiple entries, it's likely a Record<nodeId, output>
      if (entries.length > 0) {
        const hasNodeIdKeys = entries.some(([key]) => 
          key.includes('text-to-image') || key.includes('text-to-speech') || 
          key.includes('text_to_image') || key.includes('text_to_speech')
        );

        if (hasNodeIdKeys) {
          // Extract images and audio from the Record
          for (const [nodeId, output] of entries) {
            const outputData = output as any;
            
            // Check for image data
            if (outputData.imageBase64) {
              images.push(outputData.imageBase64);
            } else if (outputData.data && typeof outputData.data === 'string') {
              // Handle if data is directly the base64 string
              images.push(outputData.data);
            } else if (outputData.images && Array.isArray(outputData.images)) {
              images.push(...outputData.images);
            }
            
            // Check for audio data
            if (outputData.audioBase64 && !audioBase64) {
              audioBase64 = outputData.audioBase64;
            }
          }
        } else {
          // Not a Record format, handle as before
          if (input.imageBase64) {
            images = [input.imageBase64];
          } else if (input.images && Array.isArray(input.images)) {
            images = input.images;
          }
          if (input.audioBase64 && !audioBase64) {
            audioBase64 = input.audioBase64;
          }
        }
      }
    } 
    // Handle array input (multiple images from one node)
    else if (Array.isArray(input)) {
      images = input.map((item: any) => 
        typeof item === 'string' ? item : item.imageBase64 || item.data
      ).filter(Boolean);
    }
    // Handle single input object
    else if (input) {
      if (input.imageBase64) {
        images = [input.imageBase64];
      } else if (input.images && Array.isArray(input.images)) {
        images = input.images;
      }
      if (input.audioBase64 && !audioBase64) {
        audioBase64 = input.audioBase64;
      }
    }

    // Validate we have images
    if (images.length === 0) {
      throw new Error("At least one image is required for video creation");
    }

    // Process video client-side instead of API call
    try {
      const videoBase64 = await this.createVideoClientSide(images, audioBase64);
      
      return { 
        videoBase64, 
        imageCount: images.length, 
        hasAudio: !!audioBase64 
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Image-to-video error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Execute Text Export Node (CSV/PDF)
   */
  private async executeTextExportNode(node: WorkflowNode, input: any): Promise<any> {
    const nodeData = node.data as TextExportNodeData;
    const format: ExportFormat = nodeData.format || "pdf";

    // Attempt to derive transcript (original input) and summary (LLM content)
    let transcript = "";
    let summary = "";
    let model: string | undefined;

    // Helper to try extract fields from an object
    const tryExtract = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      if (typeof obj.data === 'string') {
        transcript = transcript || obj.data;
      }
      if (obj.text && typeof obj.text === 'string') {
        transcript = transcript || obj.text;
      }
      if (obj.content && typeof obj.content === 'string') {
        summary = summary || obj.content;
      }
      if (typeof obj.summary === 'string') {
        summary = summary || obj.summary;
      }
      if (obj.model && typeof obj.model === 'string') {
        model = model || obj.model;
      }
    };

    if (input && typeof input === 'object' && !Array.isArray(input)) {
      // Possibly multiple upstream inputs
      for (const value of Object.values(input)) {
        tryExtract(value);
      }
      // Fallback: single object
      tryExtract(input);
    } else if (typeof input === 'string') {
      // If only a string is provided, treat as summary
      summary = input;
    }

    // If we still don't have transcript, try generic extraction
    if (!transcript) {
      transcript = this.extractTextFromInput(input);
    }

    const createdAt = new Date().toISOString();
    const id = `${node.id}-${Date.now()}`;

    // Prepare filename
    const ext = format === 'csv' ? 'csv' : 'pdf';
    const baseName = nodeData.filename || `summary-{timestamp}.${ext}`;
    const timestamp = nodeData.includeTimestamp === false ? '' : Date.now().toString();
    const finalName = baseName.replace('{timestamp}', timestamp).replace('..', '.');

    if (format === 'csv') {
      const columns = nodeData.columns || ["id","inputText","summary","model","createdAt"];
      const row: Record<string, any> = {
        id,
        inputText: transcript,
        summary,
        model: model || '',
        createdAt,
      };
      const dataUrl = createCsvDataUrl([row], { columns, columnMap: nodeData.columnMap });
      return { type: 'file', format: 'csv', filename: finalName, dataUrl };
    }

    // PDF generation
    const dataUrl = await createTranscriptSummaryPdfDataUrl({
      transcript: transcript || 'No transcript provided.',
      summary: summary || 'No summary provided.',
      options: {
        title: nodeData.pdf?.title || 'Conversation Summary',
        subtitle: nodeData.pdf?.subtitle || 'Auto-generated report',
        template: 'transcript-summary',
      },
    });

    return { type: 'file', format: 'pdf', filename: finalName, dataUrl };
  }

  /**
   * Create video client-side using FFmpeg WASM
   */
  private async createVideoClientSide(
    images: string[], 
    audioBase64?: string
  ): Promise<string> {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      throw new Error('Video creation must run in browser environment');
    }

    this.log("info", "Loading FFmpeg WASM...");

    // Dynamic import to ensure browser-only execution
    const { FFmpeg } = await import('@ffmpeg/ffmpeg');
    const { toBlobURL } = await import('@ffmpeg/util');

    const ffmpeg = new FFmpeg();
    
    // Set up logging
    ffmpeg.on('log', ({ message }) => {
      console.log('[FFmpeg]', message);
    });

    ffmpeg.on('progress', ({ progress }) => {
      this.log("info", `Video processing: ${Math.round(progress * 100)}%`);
    });

    // Load FFmpeg core
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    this.log("info", "FFmpeg loaded, processing video...");

    // Write images to virtual filesystem
    for (let i = 0; i < images.length; i++) {
      const base64Data = images[i].replace(/^data:image\/\w+;base64,/, '');
      // Convert base64 to Uint8Array
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let j = 0; j < binaryString.length; j++) {
        bytes[j] = binaryString.charCodeAt(j);
      }
      await ffmpeg.writeFile(`img${i}.png`, bytes);
    }

    // Write audio if provided
    if (audioBase64) {
      const audioData = audioBase64.replace(/^data:audio\/\w+;base64,/, '');
      const binaryString = atob(audioData);
      const bytes = new Uint8Array(binaryString.length);
      for (let j = 0; j < binaryString.length; j++) {
        bytes[j] = binaryString.charCodeAt(j);
      }
      await ffmpeg.writeFile('audio.mp3', bytes);
    }

    // Calculate duration per image to match audio length
    let durationPerImage = 3; // Default 3 seconds per image
    
    if (audioBase64) {
      // Get audio duration by creating a temporary audio element
      // For now, distribute evenly: if we have audio, show each image longer
      // Assuming typical TTS is ~2-3 seconds per sentence, and we have 3 images
      // We'll use loop to repeat images until audio ends
      durationPerImage = 3; // Keep at 3 seconds, we'll loop the video
    }

    // Create concat file for slideshow
    const concatList = images
      .map((_, i) => `file 'img${i}.png'\nduration ${durationPerImage}`)
      .join('\n') + `\nfile 'img${images.length - 1}.png'`;
    await ffmpeg.writeFile('input.txt', new TextEncoder().encode(concatList));

    // Build FFmpeg command arguments
    const args = [];
    
    // Add video input with loop if we have audio
    if (audioBase64) {
      args.push('-stream_loop', '-1'); // Loop video indefinitely
    }
    
    args.push(
      '-f', 'concat',
      '-safe', '0',
      '-i', 'input.txt'
    );

    // Add audio input if provided (must be before output options)
    if (audioBase64) {
      args.push('-i', 'audio.mp3');
    }

    // Add output options (video filters, codecs, etc.)
    args.push(
      '-vf', 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30',
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-pix_fmt', 'yuv420p'
    );

    // Add audio encoding options if audio was provided
    if (audioBase64) {
      args.push('-c:a', 'aac');
      args.push('-b:a', '192k');
      args.push('-shortest'); // Stop when audio (shortest after looping) ends
    }

    args.push('output.mp4');

    // Execute FFmpeg
    await ffmpeg.exec(args);

    this.log("info", "Video processing complete, converting to base64...");

    // Read output file
    const data = await ffmpeg.readFile('output.mp4') as Uint8Array;
    
    // Convert to blob and then to base64
    const blob = new Blob([new Uint8Array(data)], { type: 'video/mp4' });
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Failed to convert video to base64'));
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Execute Output Node
   */
  private async executeOutputNode(node: WorkflowNode, input: any): Promise<any> {
    // Output node just passes through the input
    return input;
  }

  /**
   * Get input data for a node from its predecessors
   */
  private getNodeInput(nodeId: string): any {
    const incomingEdges = this.workflow.edges.filter((e) => e.target === nodeId);

    if (incomingEdges.length === 0) {
      return null;
    }

    if (incomingEdges.length === 1) {
      return this.nodeOutputs.get(incomingEdges[0].source);
    }

    // Multiple inputs - combine them
    const inputs: Record<string, any> = {};
    incomingEdges.forEach((edge) => {
      inputs[edge.source] = this.nodeOutputs.get(edge.source);
    });
    return inputs;
  }

  /**
   * Interpolate {{input}} placeholders in strings
   */
  private interpolateInput(text: string, input: any): string {
    if (!input) return text;

    // Replace {{input}} with the input value
    return text.replace(/\{\{input\}\}/g, () => {
      if (typeof input === "string") return input;
      if (input.text) return input.text;
      if (input.data) return JSON.stringify(input.data);
      return JSON.stringify(input);
    });
  }

  /**
   * Extract text from various input formats
   */
  private extractTextFromInput(input: any): string {
    if (!input) return "";
    if (typeof input === "string") return input;
    
    // Try common text fields
    if (input.text) return input.text;
    if (input.content) return input.content;
    if (input.markdown) return input.markdown;
    
    // Handle data field
    if (input.data) {
      if (typeof input.data === "string") return input.data;
      if (typeof input.data === "object") {
        // Try to extract text from nested objects
        if (input.data.text) return input.data.text;
        if (input.data.content) return input.data.content;
      }
      return JSON.stringify(input.data);
    }
    
    // Fallback: stringify the input, but truncate if too large
    const stringified = JSON.stringify(input);
    const MAX_LENGTH = 50000; // Reasonable limit for LLM context
    
    if (stringified.length > MAX_LENGTH) {
      this.log(
        "warning",
        `Input text truncated from ${stringified.length} to ${MAX_LENGTH} characters`
      );
      return stringified.substring(0, MAX_LENGTH) + "... [truncated]";
    }
    
    return stringified;
  }

  /**
   * Update node execution state
   */
  private updateNodeState(nodeId: string, state: NodeExecutionState) {
    if (this.onStateChange) {
      this.onStateChange(nodeId, state);
    }
  }

  /**
   * Add a log entry
   */
  private logCounter = 0;
  private log(
    level: "info" | "success" | "error" | "warning",
    message: string,
    nodeId?: string
  ) {
    const log: ExecutionLog = {
      id: `log-${Date.now()}-${this.logCounter++}`,
      timestamp: Date.now(),
      nodeId,
      level,
      message,
    };

    this.logs.push(log);

    if (this.onLog) {
      this.onLog(log);
    }
  }

  /**
   * Cancel the workflow execution
   */
  cancel() {
    this.abortController.abort();
    this.log("warning", "Cancelling workflow execution");
  }
}

