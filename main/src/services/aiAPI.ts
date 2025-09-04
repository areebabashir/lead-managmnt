const API_BASE_URL = 'http://localhost:8000/api';

interface AIInteraction {
  _id: string;
  type: 'email' | 'meeting_notes' | 'custom_prompt';
  prompt: string;
  response: string;
  metadata: {
    userId: string;
    contactId?: string;
    context?: any;
  };
  createdAt: string;
}

interface EmailGenerationRequest {
  contactId?: string;
  emailType: 'follow_up' | 'introduction' | 'proposal' | 'reminder' | 'thank_you';
  context: {
    subject?: string;
    tone?: 'professional' | 'friendly' | 'formal' | 'casual';
    keyPoints?: string[];
    callToAction?: string;
    customInstructions?: string;
  };
}

interface MeetingNotesRequest {
  meetingTitle: string;
  participants: string[];
  agenda: string[];
  keyPoints: string[];
  actionItems: string[];
  nextSteps: string[];
  additionalNotes?: string;
}

interface CustomPromptRequest {
  prompt: string;
  context?: {
    contactId?: string;
    type?: string;
    additionalInfo?: string;
  };
}

interface AIResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

class AIAPI {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`AI API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Email Generation
  async generateEmail(request: EmailGenerationRequest): Promise<AIResponse> {
    return this.makeRequest('/ai-assistant/generate-email', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Meeting Notes
  async generateMeetingNotes(request: MeetingNotesRequest): Promise<AIResponse> {
    return this.makeRequest('/ai-assistant/meeting-notes', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Custom Prompts
  async generateCustomPrompt(request: CustomPromptRequest): Promise<AIResponse> {
    return this.makeRequest('/ai-assistant/custom-prompt', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Get AI Interactions History
  async getAIInteractions(limit: number = 50, offset: number = 0): Promise<AIResponse> {
    return this.makeRequest(`/ai-assistant/interactions?limit=${limit}&offset=${offset}`);
  }

  // Get AI Interaction by ID
  async getAIInteraction(id: string): Promise<AIResponse> {
    return this.makeRequest(`/ai-assistant/interactions/${id}`);
  }

  // Delete AI Interaction
  async deleteAIInteraction(id: string): Promise<AIResponse> {
    return this.makeRequest(`/ai-assistant/interactions/${id}`, {
      method: 'DELETE',
    });
  }

  // Get AI Statistics
  async getAIStats(): Promise<AIResponse> {
    return this.makeRequest('/ai-assistant/stats');
  }

  // Get AI Assistant Info
  async getAIAssistantInfo(): Promise<AIResponse> {
    return this.makeRequest('/ai-assistant/info');
  }

  // Save AI Interaction
  async saveAIInteraction(interaction: Partial<AIInteraction>): Promise<AIResponse> {
    return this.makeRequest('/ai-assistant/interactions', {
      method: 'POST',
      body: JSON.stringify(interaction),
    });
  }

  // Update AI Interaction
  async updateAIInteraction(id: string, updates: Partial<AIInteraction>): Promise<AIResponse> {
    return this.makeRequest(`/ai-assistant/interactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Get AI Templates
  async getAITemplates(): Promise<AIResponse> {
    return this.makeRequest('/ai-assistant/templates');
  }

  // Save AI Template
  async saveAITemplate(template: any): Promise<AIResponse> {
    return this.makeRequest('/ai-assistant/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  }

  // Get AI Suggestions
  async getAISuggestions(context: any): Promise<AIResponse> {
    return this.makeRequest('/ai-assistant/suggestions', {
      method: 'POST',
      body: JSON.stringify(context),
    });
  }
}

export const aiAPI = new AIAPI();
export type { 
  AIInteraction, 
  EmailGenerationRequest, 
  MeetingNotesRequest, 
  CustomPromptRequest, 
  AIResponse 
};
