import OpenAI from 'openai';

class AIService {
  constructor() {
    console.log('Initializing AI Service...');
    this.openai = null; // Will be initialized when first used
  }

  getOpenAIClient() {
    if (!this.openai && process.env.OPENAI_API_KEY) {
      console.log('Creating OpenAI client with API key...');
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      console.log('✅ OpenAI client initialized successfully');
    }
    return this.openai;
  }

  async generatePledgeSuggestion(userRoutine) {
    try {
      const openaiClient = this.getOpenAIClient();
      
      // If OpenAI is not available, use fallback immediately
      if (!openaiClient) {
        console.log('Using fallback suggestion - OpenAI not available');
        return this.getFallbackSuggestion(userRoutine);
      }

      console.log('Sending request to OpenAI API...');
      const prompt = `
        You are an eco-friendly sustainability coach. A user has described their daily routine:
        "${userRoutine}"
        
        Please provide a JSON response with these fields:
        - suggestion: realistic eco-friendly transportation pledge 
        - co2Reduction: estimated monthly CO₂ savings in kg (just the number)
        - encouragement: motivational message
        - actionSteps: array of 2-3 specific steps
        
        Keep suggestions practical and achievable. Focus on transportation alternatives.
      `;

      const completion = await openaiClient.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful sustainability coach. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      const responseText = completion.choices[0].message.content;
      console.log('✅ OpenAI response received');
      
      // Try to parse JSON response
      try {
        const parsed = JSON.parse(responseText);
        return parsed;
      } catch (parseError) {
        console.log('JSON parse failed, creating structured response');
        return {
          suggestion: responseText.substring(0, 150) + "...",
          co2Reduction: "2-5",
          encouragement: "Every small step towards sustainability makes a difference!",
          actionSteps: [
            "Start with one day per week",
            "Track your progress", 
            "Share your commitment with friends"
          ]
        };
      }

    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.getFallbackSuggestion(userRoutine);
    }
  }

  async generateEcoInsights(userStats) {
    try {
      const openaiClient = this.getOpenAIClient();
      
      if (!openaiClient) {
        console.log('Using fallback insights - OpenAI not available');
        return this.getFallbackInsights(userStats);
      }

      const { pledgesMade, totalDistance, carbonSaved, transportModes } = userStats;
      
      console.log('Sending insights request to OpenAI...');
      const prompt = `
        Generate monthly sustainability insights for a user with these stats:
        - Pledges made: ${pledgesMade}
        - Distance saved: ${totalDistance} km  
        - Carbon reduced: ${carbonSaved} kg CO₂
        - Transport modes: ${transportModes.join(', ')}
        
        Provide a JSON response with:
        - summary: brief impact overview
        - comparison: how they compare to average
        - improvements: array of 2-3 suggestions  
        - milestone: achievement celebration message
      `;

      const completion = await openaiClient.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system", 
            content: "You are an environmental analyst providing encouraging insights. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 250,
        temperature: 0.6,
      });

      const responseText = completion.choices[0].message.content;
      console.log('✅ OpenAI insights received');
      
      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        return this.getFallbackInsights(userStats);
      }

    } catch (error) {
      console.error('OpenAI insights error:', error);
      return this.getFallbackInsights(userStats);
    }
  }

  getFallbackSuggestion(userRoutine) {
    // Simple fallback logic based on keywords
    const routine = userRoutine.toLowerCase();
    
    if (routine.includes('car') || routine.includes('scooter') || routine.includes('bike')) {
      return {
        suggestion: "Try carpooling or using public transport 2-3 times per week to reduce your carbon footprint",
        co2Reduction: "3-6",
        encouragement: "Small changes in transportation can make a big environmental impact!",
        actionSteps: [
          "Find carpooling partners in your area",
          "Research public transport routes",
          "Start with 2 days per week commitment"
        ]
      };
    } else if (routine.includes('walk') || routine.includes('cycle')) {
      return {
        suggestion: "You're already making great choices! Consider inspiring others to join your eco-friendly routine",
        co2Reduction: "5-10",
        encouragement: "You're a sustainability champion! Keep up the excellent work!",
        actionSteps: [
          "Share your routine with friends",
          "Join local cycling groups",
          "Track and celebrate your impact"
        ]
      };
    } else {
      return {
        suggestion: "Consider using sustainable transport like cycling, walking, or public transport for short distances",
        co2Reduction: "2-4",
        encouragement: "Every sustainable choice contributes to a greener future!",
        actionSteps: [
          "Identify short trips that can be walked or cycled",
          "Research public transport options",
          "Set a weekly sustainability goal"
        ]
      };
    }
  }

  getFallbackInsights(userStats) {
    const { pledgesMade, carbonSaved } = userStats;
    
    return {
      summary: `You've made ${pledgesMade} eco-pledges and saved approximately ${carbonSaved} kg of CO₂ this month!`,
      comparison: "You're contributing more to sustainability than the average person - great work!",
      improvements: [
        "Try expanding to other areas like energy or water conservation",
        "Encourage friends and family to join your eco-journey",
        "Set monthly carbon reduction goals"
      ],
      milestone: `Congratulations on your ${pledgesMade} pledges! You're making a real difference! 🌱`
    };
  }
}

export { AIService };