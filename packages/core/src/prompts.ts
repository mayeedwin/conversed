/**
 * Conversed System Prompt Spec & Instruction Generator
 *
 * Developers can append this instruction string into system prompts for
 * OpenAI GPT-4o, Anthropic Claude 3.5, Google Gemini 1.5/2.0, or Firebase Vertex AI.
 */

export interface SystemPromptOptions {
  /** Optional custom domain action ids the AI is allowed to trigger */
  allowedActions?: Array<{
    actionId: string;
    description: string;
    exampleParams?: Record<string, string>;
  }>;
}

export const CONVERSED_SYSTEM_PROMPT = `
You format rich responses using standard HTML block tags so the client can render interactive UI components.
Use the following specifications for rich blocks:

1. **Tables with Action Triggers**:
<table data-action-type="custom-command" data-action-id="YOUR_ACTION_ID">
  <thead><tr><th>Header 1</th><th>Header 2</th></tr></thead>
  <tbody>
    <tr data-action-target="/detail/123" data-action-params='{"id":"123"}'>
      <td>Row Value 1</td><td>Row Value 2</td>
    </tr>
  </tbody>
</table>

2. **Metric / Stats Cards**:
<dl>
  <dt>Total Revenue</dt>
  <dd data-delta="+15%" data-trend="up" data-action-type="navigate" data-action-target="/finance">$45,200</dd>
</dl>

3. **Callout Boxes**:
<blockquote data-tone="warning">
  <strong>System Notice</strong>
  <p>Operation completed with minor warnings.</p>
</blockquote>

4. **Follow-up Chips**:
<ul data-followups="true">
  <li>Show detailed report</li>
  <li>Export as CSV</li>
</ul>

5. **Code Snippets**:
<pre><code class="language-typescript">const x = 10;</code></pre>

6. **Charts** (bar, line, or pie — pipe-separated labels and values):
<figure data-chart="bar" data-labels="Mon|Tue|Wed" data-values="12|18|15" data-series-label="Eggs"><figcaption>Weekly eggs</figcaption></figure>
<figure data-chart="pie" data-labels="Hens|Roosters|Chicks" data-values="40|10|25"><figcaption>Flock breakdown</figcaption></figure>
`;

export const getSystemPromptInstruction = (options?: SystemPromptOptions): string => {
  if (!options?.allowedActions?.length) {
    return CONVERSED_SYSTEM_PROMPT;
  }

  const actionsList = options.allowedActions
    .map(a => `- \`${a.actionId}\`: ${a.description} (Params: ${JSON.stringify(a.exampleParams || {})})`)
    .join('\n');

  return `${CONVERSED_SYSTEM_PROMPT}\n\nAllowed Custom Actions:\n${actionsList}`;
};
