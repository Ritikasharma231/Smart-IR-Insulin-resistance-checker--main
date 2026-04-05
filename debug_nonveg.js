// Debug non-veg keyword specifically
import ChatbotService from './src/services/chatbotService.js';

const chatbot = new ChatbotService();

console.log("🔍 Debugging 'non veg' Keyword:\n");

const testMessage = "non veg";
const lowerMessage = testMessage.toLowerCase();

console.log(`Original message: "${testMessage}"`);
console.log(`Lowercase: "${lowerMessage}"`);

// Test each condition individually
const conditions = [
  { name: 'non-veg', test: lowerMessage.includes('non-veg') },
  { name: 'non veg', test: lowerMessage.includes('non veg') },
  { name: 'non vegetarian', test: lowerMessage.includes('non vegetarian') },
  { name: 'nonveg', test: lowerMessage.includes('nonveg') },
  { name: 'meat', test: lowerMessage.includes('meat') },
  { name: 'chicken', test: lowerMessage.includes('chicken') },
  { name: 'fish', test: lowerMessage.includes('fish') },
  { name: 'eggs', test: lowerMessage.includes('eggs') }
];

console.log("\n🧪 Individual Condition Tests:");
conditions.forEach(condition => {
  console.log(`${condition.name}: ${condition.test ? '✅ MATCH' : '❌ NO MATCH'}`);
});

// Test vegetarian conditions
const vegConditions = [
  { name: 'vegetarian', test: lowerMessage.includes('vegetarian') },
  { name: 'veg', test: lowerMessage.includes('veg') },
  { name: 'plant-based', test: lowerMessage.includes('plant-based') }
];

console.log("\n🥬 Vegetarian Condition Tests:");
vegConditions.forEach(condition => {
  console.log(`${condition.name}: ${condition.test ? '✅ MATCH' : '❌ NO MATCH'}`);
});

// Test actual response
const response = chatbot.getFallbackResponse(testMessage, null);
console.log(`\n📋 Response Type: ${response.split('\n')[0]}`);
console.log(`Is Non-Veg: ${response.includes('NON-VEGETARIAN') ? 'YES ✅' : 'NO ❌'}`);
console.log(`Is Veg: ${response.includes('VEGETARIAN') && !response.includes('NON-VEGETARIAN') ? 'YES ❌' : 'NO ✅'}`);

console.log("\n🎯 Debug Complete!");
