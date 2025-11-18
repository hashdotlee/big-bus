import { BaseExtension, ExtensionCategory } from '../core/base-extension';

/**
 * AI service types
 */
export enum AIServiceType {
  CHATBOT = 'chatbot',
  SENTIMENT_ANALYSIS = 'sentiment_analysis',
  TEXT_CLASSIFICATION = 'text_classification',
  NAMED_ENTITY_RECOGNITION = 'ner',
  TRANSLATION = 'translation',
  SUMMARIZATION = 'summarization',
  QUESTION_ANSWERING = 'question_answering',
  RECOMMENDATION = 'recommendation',
  PREDICTION = 'prediction',
  ANOMALY_DETECTION = 'anomaly_detection',
  IMAGE_RECOGNITION = 'image_recognition',
  SPEECH_TO_TEXT = 'speech_to_text',
  TEXT_TO_SPEECH = 'text_to_speech',
}

/**
 * AI model configuration
 */
export interface AIModelConfig {
  modelName?: string;
  modelVersion?: string;
  apiKey?: string;
  apiEndpoint?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  timeout?: number;
  [key: string]: any;
}

/**
 * Chat message
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;
  metadata?: Record<string, any>;
}

/**
 * Chat request
 */
export interface ChatRequest {
  messages: ChatMessage[];
  userId?: string;
  sessionId?: string;
  context?: Record<string, any>;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

/**
 * Chat response
 */
export interface ChatResponse {
  message: ChatMessage;
  finishReason?: 'stop' | 'length' | 'content_filter';
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: Record<string, any>;
}

/**
 * Analysis request
 */
export interface AnalysisRequest {
  text: string;
  language?: string;
  context?: Record<string, any>;
}

/**
 * Sentiment analysis response
 */
export interface SentimentAnalysisResponse {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  confidence: number;
  aspects?: Array<{
    aspect: string;
    sentiment: string;
    score: number;
  }>;
}

/**
 * Text classification response
 */
export interface TextClassificationResponse {
  category: string;
  confidence: number;
  categories: Array<{
    name: string;
    score: number;
  }>;
}

/**
 * Named entity recognition response
 */
export interface NERResponse {
  entities: Array<{
    text: string;
    type: string;
    startIndex: number;
    endIndex: number;
    confidence: number;
  }>;
}

/**
 * Translation request
 */
export interface TranslationRequest {
  text: string;
  sourceLanguage?: string;
  targetLanguage: string;
}

/**
 * Translation response
 */
export interface TranslationResponse {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence?: number;
}

/**
 * Summarization request
 */
export interface SummarizationRequest {
  text: string;
  maxLength?: number;
  minLength?: number;
  style?: 'extractive' | 'abstractive';
}

/**
 * Summarization response
 */
export interface SummarizationResponse {
  summary: string;
  originalLength: number;
  summaryLength: number;
}

/**
 * Recommendation request
 */
export interface RecommendationRequest {
  userId: string;
  itemId?: string;
  context?: Record<string, any>;
  limit?: number;
  filters?: Record<string, any>;
}

/**
 * Recommendation response
 */
export interface RecommendationResponse {
  recommendations: Array<{
    itemId: string;
    score: number;
    reason?: string;
    metadata?: Record<string, any>;
  }>;
}

/**
 * Prediction request
 */
export interface PredictionRequest {
  features: Record<string, any>;
  modelType?: string;
}

/**
 * Prediction response
 */
export interface PredictionResponse {
  prediction: any;
  confidence: number;
  probabilities?: Record<string, number>;
  explanation?: string;
}

/**
 * Anomaly detection request
 */
export interface AnomalyDetectionRequest {
  data: Array<Record<string, any>>;
  threshold?: number;
}

/**
 * Anomaly detection response
 */
export interface AnomalyDetectionResponse {
  anomalies: Array<{
    index: number;
    score: number;
    reason?: string;
  }>;
  threshold: number;
}

/**
 * Base interface for AI service extensions
 */
export interface IAIServiceExtension extends BaseExtension {
  readonly category: ExtensionCategory.AI;

  /**
   * Get supported service types
   */
  getSupportedServiceTypes(): AIServiceType[];

  /**
   * Check if service type is supported
   */
  supportsServiceType(type: AIServiceType): boolean;
}

/**
 * Customer support chatbot extension
 */
export interface ICustomerSupportExtension extends IAIServiceExtension {
  /**
   * Send chat message
   */
  chat(request: ChatRequest): Promise<ChatResponse>;

  /**
   * Get suggested responses
   */
  getSuggestedResponses?(query: string, context?: Record<string, any>): Promise<string[]>;

  /**
   * Analyze customer intent
   */
  analyzeIntent?(message: string): Promise<{
    intent: string;
    confidence: number;
    entities?: Record<string, any>;
  }>;

  /**
   * Escalate to human agent
   */
  escalateToHuman?(sessionId: string, reason: string): Promise<void>;
}

/**
 * Analytics AI extension
 */
export interface IAnalyticsAIExtension extends IAIServiceExtension {
  /**
   * Predict future metrics
   */
  predict(request: PredictionRequest): Promise<PredictionResponse>;

  /**
   * Detect anomalies in data
   */
  detectAnomalies(request: AnomalyDetectionRequest): Promise<AnomalyDetectionResponse>;

  /**
   * Generate insights
   */
  generateInsights?(data: Record<string, any>): Promise<string[]>;

  /**
   * Recommend actions
   */
  recommendActions?(context: Record<string, any>): Promise<Array<{
    action: string;
    impact: number;
    confidence: number;
  }>>;
}

/**
 * NLP extension
 */
export interface INLPExtension extends IAIServiceExtension {
  /**
   * Analyze sentiment
   */
  analyzeSentiment(request: AnalysisRequest): Promise<SentimentAnalysisResponse>;

  /**
   * Classify text
   */
  classifyText(request: AnalysisRequest): Promise<TextClassificationResponse>;

  /**
   * Extract named entities
   */
  extractEntities(request: AnalysisRequest): Promise<NERResponse>;

  /**
   * Translate text
   */
  translate(request: TranslationRequest): Promise<TranslationResponse>;

  /**
   * Summarize text
   */
  summarize(request: SummarizationRequest): Promise<SummarizationResponse>;
}

/**
 * Recommendation engine extension
 */
export interface IRecommendationExtension extends IAIServiceExtension {
  /**
   * Get recommendations
   */
  getRecommendations(request: RecommendationRequest): Promise<RecommendationResponse>;

  /**
   * Track user behavior
   */
  trackBehavior?(userId: string, event: {
    type: string;
    itemId?: string;
    data?: Record<string, any>;
  }): Promise<void>;

  /**
   * Update recommendation model
   */
  updateModel?(data: Array<Record<string, any>>): Promise<void>;
}

/**
 * Abstract base class for AI service extensions
 */
export abstract class BaseAIServiceExtension extends BaseExtension implements IAIServiceExtension {
  readonly category = ExtensionCategory.AI;
  protected modelConfig: AIModelConfig;

  abstract getSupportedServiceTypes(): AIServiceType[];

  async initialize(config: AIModelConfig): Promise<void> {
    await super.initialize(config);
    this.modelConfig = config;
  }

  supportsServiceType(type: AIServiceType): boolean {
    return this.getSupportedServiceTypes().includes(type);
  }

  protected async callAPI(endpoint: string, data: any): Promise<any> {
    // Base implementation - override in subclasses
    throw new Error('API call not implemented');
  }
}
