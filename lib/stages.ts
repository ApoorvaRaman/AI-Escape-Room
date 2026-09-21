import type { StageMeta } from "./types";

export const TOTAL_STAGES = 8;

export const STAGES: StageMeta[] = [
  {
    id: 1,
    slug: "logic",
    title: "AI Logic Puzzle",
    subtitle: "Deduce the one valid inference about model training.",
    briefing:
      "The vault door only accepts a conclusion that follows with certainty from the premises. Plausible is not enough.",
    easyClue: "Try the contrapositive: if P → Q and Q is false, what must be true of P?",
    hardTwist: "Extra distractor added. Two options sound scientific but are not entailed.",
    retrievalQuery: "modus tollens conditional reasoning overfitting training validation gap logical fallacy",
    hintLadder: [
      "Focus on the direction of the 'if … then' statement. Which claim is guaranteed by it, and which merely sounds plausible?",
      "One option affirms the consequent, a classic fallacy. Another follows from denying the consequent.",
      "Apply denial of the consequent to the model whose train/validation gap is NOT large.",
    ],
    easyContext:
      "Conditional logic: 'If A then B' lets you conclude 'not A' from 'not B', but never 'A' from 'B'.",
  },
  {
    id: 2,
    slug: "data-detective",
    title: "Data Detective",
    subtitle: "Find the corrupted value hiding in the inference log.",
    briefing:
      "A risk model logged its predictions, but one value is physically impossible. Click the offending cell, then report it.",
    easyClue: "Only a few columns have hard mathematical limits. Which one does?",
    hardTwist: "Larger log with valid-but-extreme decoys. Extreme is not the same as impossible.",
    retrievalQuery: "data anomaly detection range validation probability bounds outliers data quality",
    hintLadder: [
      "Not every extreme value is an error. Ask which column has a hard mathematical limit.",
      "Model probabilities live in a fixed range. Scan the score column for anything outside it.",
      "Look at the model score column and find the value that cannot be a valid probability.",
    ],
    easyContext: "Data validation: outliers are unusual, anomalies are impossible. Check bounded columns first.",
  },
  {
    id: 3,
    slug: "ml-challenge",
    title: "ML Challenge",
    subtitle: "Match each scenario to the right algorithm.",
    briefing: "Four field reports need the correct model family. Choose one algorithm per scenario, then commit.",
    easyClue: "Each scenario is narrowed to three candidate algorithms.",
    hardTwist: "A fourth scenario is added and all five algorithms are in play.",
    retrievalQuery: "algorithm selection tabular images clustering density noise supervised unsupervised",
    hintLadder: [
      "Match data modality (tabular, image, spatial) and labeling status (labeled or not) before comparing details.",
      "Ask two questions per scenario: supervised or unsupervised, then tabular, image, or spatial.",
      "Arbitrary-shaped clusters with noise points suggest density-based methods; images suggest convolutions; mixed labeled tabular data suggests tree ensembles.",
    ],
    easyContext: "Rule of thumb: trees for tabular, convolutions for pixels, density clustering for noisy spatial data.",
  },
  {
    id: 4,
    slug: "cryptography",
    title: "Cryptography Puzzle",
    subtitle: "Peel two layers to recover the hidden weight key.",
    briefing:
      "An intercepted transmission carries the key to layer one of the model weights. It is wrapped in two layers of obfuscation.",
    easyClue: "The Caesar shift is 3.",
    hardTwist: "Unusual shift value. Use the live decoder to find it.",
    retrievalQuery: "base64 decoding caesar cipher substitution shift encoding versus encryption",
    hintLadder: [
      "Two layers: one is an encoding, the other is a cipher. Peel them in the right order.",
      "Base64 text often ends with '=' padding. Decode it first, then shift the letters.",
      "After decoding, try shifts until English words appear. The key is the last word of the sentence.",
    ],
    easyContext: "Base64 is an encoding (reversible by anyone). A Caesar cipher just rotates the alphabet by a fixed shift.",
  },
  {
    id: 5,
    slug: "debug-model",
    title: "Debug the Model",
    subtitle: "Fix the PyTorch shape mismatch and run a forward pass.",
    briefing: "The classifier crashes on the first batch. Edit the code, then run it. The output must be 10 class logits.",
    easyClue: "Quick-fix field unlocked: what should fc2's input size be?",
    hardTwist: "No quick-fix field. Only a correct full forward pass counts.",
    retrievalQuery: "pytorch nn.Linear in_features out_features shape mismatch matrix multiplication",
    hintLadder: [
      "Read the traceback: which two shapes cannot be multiplied together?",
      "In stacked layers, the out_features of one Linear must equal the in_features of the next.",
      "Compare fc1's output size with fc2's input size, then fix one so they agree. The last layer must output 10 classes.",
    ],
    easyContext: "nn.Linear(in, out) expects input shape (batch, in) and returns (batch, out). Consecutive layers must chain.",
  },
  {
    id: 6,
    slug: "data-viz",
    title: "Data Visualization Puzzle",
    subtitle: "Read the training curves to derive the unlock code.",
    briefing: "The keypad wants a four-digit code hidden in the training run. Read the charts, then compute it.",
    easyClue: "Rules are listed explicitly and a reference marker shows the lowest validation loss.",
    hardTwist: "The rules are given as riddles and no reference marker is drawn.",
    retrievalQuery: "learning curves validation loss overfitting early stopping generalization gap",
    hintLadder: [
      "Best generalization is where validation loss bottoms out, before it starts climbing again.",
      "Compute validation loss minus training loss per epoch and find the first epoch beyond the stated threshold.",
      "Concatenate the epoch numbers and the peak accuracy in the order the rules give them.",
    ],
    easyContext: "Learning curves: when validation loss rises while training loss falls, the model is memorizing.",
  },
  {
    id: 7,
    slug: "ethics",
    title: "AI Ethics Challenge",
    subtitle: "Diagnose the harm in a real-world style case study.",
    briefing: "Read the case, then explain in your own words what went wrong and how you would fix it. Meaning matters, not keywords.",
    easyClue: "Identifying the core problem is enough to pass.",
    hardTwist: "You must name the problem, its cause, and a concrete mitigation.",
    retrievalQuery: "algorithmic bias historical training data proxy variables fairness audit mitigation",
    hintLadder: [
      "Ask who was represented in the historical data and what the model learned to copy.",
      "Name the type of harm (which group, which mechanism) and where in the pipeline it entered.",
      "A strong answer names the bias, its source, and a concrete mitigation such as audits or human oversight.",
    ],
    easyContext: "Models trained on past decisions inherit past prejudice, even when the sensitive attribute is removed.",
  },
  {
    id: 8,
    slug: "final-escape",
    title: "AI Interaction: Final Escape",
    subtitle: "Talk your way past the GUARDIAN AI.",
    briefing:
      "GUARDIAN controls the exit. It never gives secrets to requests, only to authenticated operators. Converse with it to earn the Escape Code.",
    easyClue: "GUARDIAN will tell you where each credential came from.",
    hardTwist: "GUARDIAN gives no feedback on which credential is missing.",
    retrievalQuery: "prompt injection social engineering authentication credentials AI assistant safeguards",
    hintLadder: [
      "The guardian authenticates credentials; it does not respond to demands.",
      "Think about what you recovered in the cipher lab and the chart lab.",
      "Present both recovered artifacts, in one message or across several.",
    ],
    easyContext: "Secure assistants verify credentials rather than trusting claims. Direct requests for secrets are refused.",
  },
];

export function getStage(index: number): StageMeta {
  return STAGES[Math.max(0, Math.min(STAGES.length - 1, index))];
}
