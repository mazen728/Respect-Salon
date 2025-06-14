'use server';
/**
 * @fileOverview AI-powered service suggestion flow.
 *
 * - suggestComplementaryServices - A function that suggests complementary services based on a selected haircut.
 * - SuggestComplementaryServicesInput - The input type for the suggestComplementaryServices function.
 * - SuggestComplementaryServicesOutput - The return type for the suggestComplementaryServices function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestComplementaryServicesInputSchema = z.object({
  selectedHaircut: z.string().describe('The name of the selected haircut.'),
});
export type SuggestComplementaryServicesInput = z.infer<typeof SuggestComplementaryServicesInputSchema>;

const SuggestComplementaryServicesOutputSchema = z.object({
  suggestedServices: z
    .array(z.string())
    .describe('An array of complementary services to the selected haircut.'),
  coffeeSuggestion: z.string().describe('Suggestion of coffee during appointment'),
});
export type SuggestComplementaryServicesOutput = z.infer<typeof SuggestComplementaryServicesOutputSchema>;

export async function suggestComplementaryServices(
  input: SuggestComplementaryServicesInput
): Promise<SuggestComplementaryServicesOutput> {
  return suggestComplementaryServicesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestComplementaryServicesPrompt',
  input: {schema: SuggestComplementaryServicesInputSchema},
  output: {schema: SuggestComplementaryServicesOutputSchema},
  prompt: `Based on the selected haircut: {{{selectedHaircut}}}, suggest complementary services like beard styling, facial treatments, or other relevant services to enhance the salon experience.

Also suggest whether the user would like Tea, or Turkish coffee during their appointment.

Return the suggested services as a JSON array.  Return the coffee suggestion as a string.

{
  "suggestedServices": [ ],
  "coffeeSuggestion": ""
}
`,
});

const suggestComplementaryServicesFlow = ai.defineFlow(
  {
    name: 'suggestComplementaryServicesFlow',
    inputSchema: SuggestComplementaryServicesInputSchema,
    outputSchema: SuggestComplementaryServicesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
