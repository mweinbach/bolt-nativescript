import { Observable } from '@nativescript/core';
import { Http } from '@nativescript/core';

export function createViewModel() {
    const viewModel = new Observable();
    viewModel.apiKey = '';
    viewModel.userMessage = '';
    viewModel.aiResponse = '';
    viewModel.isLoading = false;

    viewModel.saveApiKey = function() {
        console.log('API Key saved:', viewModel.apiKey);
        // In a real app, you'd want to securely store this API key
    };

    viewModel.sendMessage = async function() {
        if (!viewModel.apiKey) {
            viewModel.set('aiResponse', 'Please enter your OpenRouter API key first.');
            return;
        }

        if (!viewModel.userMessage) {
            viewModel.set('aiResponse', 'Please enter a message.');
            return;
        }

        viewModel.set('isLoading', true);
        viewModel.set('aiResponse', 'Thinking...');

        try {
            const response = await Http.request({
                url: 'https://openrouter.ai/api/v1/chat/completions',
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${viewModel.apiKey}`,
                    'Content-Type': 'application/json'
                },
                content: JSON.stringify({
                    'model': 'openai/gpt-3.5-turbo',
                    'messages': [
                        {
                            'role': 'user',
                            'content': viewModel.userMessage
                        }
                    ]
                })
            });

            const result = response.content.toJSON();
            if (result.choices && result.choices.length > 0) {
                viewModel.set('aiResponse', result.choices[0].message.content);
            } else {
                viewModel.set('aiResponse', 'Sorry, I couldn\'t generate a response.');
            }
        } catch (error) {
            console.error('Error:', error);
            if (error.responseText) {
                try {
                    const errorJson = JSON.parse(error.responseText);
                    viewModel.set('aiResponse', `Error: ${errorJson.error.message}`);
                } catch (e) {
                    viewModel.set('aiResponse', 'An error occurred while fetching the response.');
                }
            } else {
                viewModel.set('aiResponse', 'Network error. Please check your internet connection.');
            }
        } finally {
            viewModel.set('isLoading', false);
        }
    };

    return viewModel;
}