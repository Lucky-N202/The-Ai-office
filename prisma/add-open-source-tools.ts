/**
 * One-off: adds open-source AI tools to the catalog for variety — your 24
 * existing tools are almost entirely closed/commercial (only Stable
 * Diffusion was OPEN_SOURCE). These 9 were checked against current 2026
 * sources rather than pulled from memory — a few well-known open-source
 * coding tools (e.g. Continue.dev, AutoGen) have gone stale/superseded this
 * year, so they were deliberately left out in favor of what's actually
 * still active.
 *
 * Safe to re-run — upserts by slug.
 *
 * Run once:
 *   npx tsx prisma/add-open-source-tools.ts
 */
import { PrismaClient, PricingModel } from "@prisma/client";

const prisma = new PrismaClient();

const tools = [
  {
    name: "Aider",
    slug: "aider",
    category: "coding-dev-tools",
    tagline: "Open-source AI pair programmer that edits your code right in the terminal.",
    description:
      "Aider is an open-source AI pair programmer that runs in your terminal and edits code directly in your local Git repository. It builds a map of your codebase for context, makes coordinated edits across multiple files, and automatically commits each change with a descriptive message — keeping your git history clean and easy to review or revert. Aider works with whichever LLM you choose to connect, including Claude, GPT-4, Gemini, or fully local models via Ollama, so you aren't locked into one provider. It's best suited to developers who want a focused, git-native editing loop rather than a full IDE experience.",
    websiteUrl: "https://aider.chat",
    logoUrl: "https://www.google.com/s2/favicons?domain=aider.chat&sz=128",
    pricingModel: PricingModel.OPEN_SOURCE,
    features: [
      "Git-aware, auto-committed edits",
      "Coordinated multi-file changes",
      "Repository mapping for full codebase context",
      "Works with Claude, GPT-4, Gemini, or local models via Ollama",
      "Terminal-first workflow",
    ],
    pros: [
      "Free and fully open-source (Apache 2.0)",
      "Bring your own model — no vendor lock-in",
      "Clean, reversible git history from auto-commits",
      "Strong at disciplined, git-native editing",
    ],
    cons: [
      "Terminal-only, no graphical interface",
      "Steeper learning curve than IDE-integrated tools",
      "Cost depends entirely on which model you connect it to",
    ],
    tags: ["open source", "coding", "terminal", "git", "self-hosted"],
    useCases: [
      "Git-native pair programming from the terminal",
      "Coordinated multi-file refactors",
      "Working with your own choice of LLM instead of a locked-in provider",
    ],
    alternatives: ["github-copilot", "cursor"],
    rating: 4.6,
    reviewCount: 2100,
  },
  {
    name: "Cline",
    slug: "cline",
    category: "coding-dev-tools",
    tagline: "Open-source AI coding agent for VS Code and JetBrains, works with any model.",
    description:
      "Cline is an open-source AI coding agent that runs as an extension inside VS Code and JetBrains IDEs. Its defining feature is a Plan/Act workflow: it proposes a plan and shows exactly what it intends to change before applying anything, giving you an approval step most autonomous coding agents skip. It supports Claude, GPT-4, and local models, and has grown into one of the most active open-source coding-agent communities. It's a good fit for developers who want agentic help without giving up review control over every change.",
    websiteUrl: "https://cline.bot",
    logoUrl: "https://www.google.com/s2/favicons?domain=cline.bot&sz=128",
    pricingModel: PricingModel.OPEN_SOURCE,
    features: [
      "Plan/Act mode for reviewing changes before they're applied",
      "Works with Claude, GPT-4, and local models",
      "VS Code and JetBrains support",
      "Approval flow for every proposed change",
      "Large, actively maintained open-source community",
    ],
    pros: [
      "Free and open-source",
      "Bring-your-own-model flexibility",
      "Approval-based workflow gives more control than fully autonomous agents",
      "Frequent updates and active development",
    ],
    cons: [
      "Requires your own API key — model costs are separate (a paid Cline.bot hosted tier exists as an alternative, but the core extension is free)",
      "Approval steps can feel slower than fully autonomous tools",
      "More setup/configuration than a plug-and-play commercial tool",
    ],
    tags: ["open source", "coding", "VS Code", "JetBrains", "self-hosted"],
    useCases: [
      "Reviewing AI-proposed changes before they're applied",
      "Coding with your own model of choice inside your existing editor",
      "Teams wanting more oversight over agentic code edits",
    ],
    alternatives: ["github-copilot", "cursor", "aider"],
    rating: 4.5,
    reviewCount: 1800,
  },
  {
    name: "Ollama",
    slug: "ollama",
    category: "coding-dev-tools",
    tagline: "Run open-weight LLMs like Llama, Qwen, and DeepSeek locally on your own machine.",
    description:
      "Ollama is an open-source tool for downloading and running open-weight language models — Llama, Qwen, DeepSeek, Mistral, and many others — entirely on your own hardware. It wraps the complexity of local model serving into a simple CLI and exposes an OpenAI-compatible API, which is why it's become the default local backend for a huge range of other open-source AI tools, including several others in this list. Once a model is downloaded, everything runs offline, with no data leaving your machine and no per-token costs.",
    websiteUrl: "https://ollama.com",
    logoUrl: "https://www.google.com/s2/favicons?domain=ollama.com&sz=128",
    pricingModel: PricingModel.OPEN_SOURCE,
    features: [
      "One-command install and run for open-weight models",
      "Supports Llama, Qwen, DeepSeek, Mistral, and many more",
      "OpenAI-compatible REST API",
      "Works on Mac, Windows, and Linux",
      "Fully offline after a model is downloaded",
    ],
    pros: [
      "Completely free and open-source",
      "Full data privacy — nothing leaves your machine",
      "Huge and fast-growing library of supported models",
      "Simple CLI with minimal setup",
    ],
    cons: [
      "Performance depends entirely on your own hardware",
      "Larger models need a capable GPU to run well",
      "No built-in chat UI — typically paired with another tool for that",
    ],
    tags: ["open source", "local LLM", "self-hosted", "privacy", "developer tools"],
    useCases: [
      "Running AI models fully offline for privacy or cost reasons",
      "Powering other open-source tools with a local model backend",
      "Experimenting with open-weight models without per-token API costs",
    ],
    alternatives: [],
    rating: 4.7,
    reviewCount: 5200,
  },
  {
    name: "Whisper",
    slug: "whisper",
    category: "audio-voice",
    tagline: "OpenAI's open-source speech-to-text model, runs locally or via API.",
    description:
      "Whisper is OpenAI's open-source automatic speech recognition model, trained on a large, diverse multilingual dataset and released with open weights. It handles transcription and translation across 90+ languages and is robust to accents, background noise, and technical vocabulary. Because the model itself is open, it can be run entirely offline — a large ecosystem of tools (faster-whisper, whisper.cpp, and others) has grown up around optimizing it for speed on different hardware, from laptops to servers.",
    websiteUrl: "https://github.com/openai/whisper",
    logoUrl: "https://www.google.com/s2/favicons?domain=github.com&sz=128",
    pricingModel: PricingModel.OPEN_SOURCE,
    features: [
      "Multilingual speech recognition across 90+ languages",
      "Runs fully offline once downloaded",
      "Multiple model sizes to trade off speed vs. accuracy",
      "Robust to accents, noise, and technical language",
      "Open weights, free to self-host",
    ],
    pros: [
      "Free and open-source",
      "Strong accuracy across many languages",
      "No per-minute transcription costs when self-hosted",
      "Wide ecosystem of optimized variants (faster-whisper, whisper.cpp)",
    ],
    cons: [
      "Larger, more accurate models need a capable GPU for speed",
      "No built-in speaker diarization out of the box",
      "Library/CLI based — no polished consumer app by default",
    ],
    tags: ["open source", "speech-to-text", "transcription", "self-hosted"],
    useCases: [
      "Offline, private audio/video transcription",
      "Building custom transcription features into your own app",
      "Multilingual subtitle or captioning generation",
    ],
    alternatives: [],
    rating: 4.7,
    reviewCount: 4300,
  },
  {
    name: "ComfyUI",
    slug: "comfyui",
    category: "image-generation",
    tagline: "Node-based, open-source interface for Stable Diffusion and other image models.",
    description:
      "ComfyUI is an open-source, node-based interface for running Stable Diffusion and other open image and video generation models. Instead of a single prompt box, you build a visual graph of the exact steps you want — sampling, upscaling, inpainting, ControlNet conditioning, and more — giving far more control and repeatability than prompt-only tools. Workflows can be saved and shared as files, and a large community maintains custom nodes that extend it well beyond the base functionality. It runs entirely on your own hardware.",
    websiteUrl: "https://www.comfy.org",
    logoUrl: "https://www.google.com/s2/favicons?domain=comfy.org&sz=128",
    pricingModel: PricingModel.OPEN_SOURCE,
    features: [
      "Visual, node-based workflow editor",
      "Fine-grained control over every generation step",
      "Supports Stable Diffusion, Flux, and other open models",
      "Shareable, reusable workflow files",
      "Large library of community-built custom nodes",
    ],
    pros: [
      "Free and open-source",
      "Far more control than prompt-only interfaces",
      "Runs entirely on your own hardware",
      "Active community constantly adding new nodes and workflows",
    ],
    cons: [
      "Steep learning curve, especially for non-technical users",
      "Requires a capable GPU for reasonable speed",
      "Complex workflows can be hard to read at a glance",
    ],
    tags: ["open source", "image generation", "self-hosted", "Stable Diffusion"],
    useCases: [
      "Fine-grained, repeatable control over image generation pipelines",
      "Building complex multi-step workflows (upscaling, inpainting, ControlNet)",
      "Running open image models entirely on your own hardware",
    ],
    alternatives: ["stable-diffusion", "midjourney", "dalle-3"],
    rating: 4.6,
    reviewCount: 2600,
  },
  {
    name: "CrewAI",
    slug: "crewai",
    category: "productivity-agents",
    tagline: "Open-source framework for orchestrating teams of collaborating AI agents.",
    description:
      "CrewAI is an open-source Python framework for building teams of AI agents that collaborate on a task, each with a defined role, goal, and set of tools. It supports both sequential and hierarchical process modes for coordinating hand-offs between agents, and works with any LLM provider rather than locking you into one. It's aimed at developers who want to design and control custom multi-agent workflows in code, rather than use a pre-built, hosted agent product.",
    websiteUrl: "https://www.crewai.com",
    logoUrl: "https://www.google.com/s2/favicons?domain=crewai.com&sz=128",
    pricingModel: PricingModel.OPEN_SOURCE,
    features: [
      "Role- and goal-based agent definitions",
      "Sequential and hierarchical multi-agent orchestration",
      "Works with any LLM provider",
      "Python-based, integrates into existing codebases",
      "Active open-source development",
    ],
    pros: [
      "Free, open-source core",
      "Not locked to one model provider",
      "Good fit for structured, role-based agent workflows",
      "Actively developed with a growing community",
    ],
    cons: [
      "Requires Python development skills to set up",
      "You still need to bring/pay for your own underlying model",
      "More setup effort than a hosted, no-code agent product",
    ],
    tags: ["open source", "AI agents", "automation", "self-hosted"],
    useCases: [
      "Building custom multi-agent automation for a specific business process",
      "Prototyping role-based agent teams (e.g. researcher + writer + reviewer)",
      "Teams wanting full control over their own agent orchestration logic",
    ],
    alternatives: ["replit-agent"],
    rating: 4.4,
    reviewCount: 1400,
  },
  {
    name: "n8n",
    slug: "n8n",
    category: "productivity-agents",
    tagline: "Open-source workflow automation platform with built-in AI agent nodes.",
    description:
      "n8n is a workflow automation platform that combines traditional app-to-app integrations with built-in AI Agent and LLM nodes, all built on a visual, node-based canvas. It connects to hundreds of apps and services, supports conditional logic and error handling for complex flows, and can be self-hosted for free under its fair-code license, or used as a managed cloud service. It's a strong self-hosted alternative to tools like Zapier for teams that want AI woven directly into their automation.",
    websiteUrl: "https://n8n.io",
    logoUrl: "https://www.google.com/s2/favicons?domain=n8n.io&sz=128",
    pricingModel: PricingModel.OPEN_SOURCE,
    features: [
      "Visual, node-based workflow builder",
      "Built-in AI Agent and LLM nodes alongside 400+ integrations",
      "Self-hostable or available as managed cloud",
      "Conditional logic, loops, and error handling",
      "Fair-code license — free to self-host",
    ],
    pros: [
      "Free to self-host indefinitely",
      "Combines traditional automation with AI in one tool",
      "Large library of pre-built app integrations",
      "Visual editor is approachable even for non-developers",
    ],
    cons: [
      "Fair-code license has some commercial-use restrictions — not pure open-source for every use case",
      "Self-hosting requires basic server/DevOps knowledge",
      "Very large workflows can become hard to manage visually",
    ],
    tags: ["open source", "automation", "workflow", "AI agents", "self-hosted"],
    useCases: [
      "Automating multi-step business processes that combine AI with app integrations",
      "Self-hosted alternative to Zapier with AI built in",
      "Building custom internal tools without a full development team",
    ],
    alternatives: ["replit-agent"],
    rating: 4.6,
    reviewCount: 3800,
  },
  {
    name: "Open WebUI",
    slug: "open-webui",
    category: "productivity-agents",
    tagline: "Self-hosted, open-source ChatGPT-style interface for local and API-based models.",
    description:
      "Open WebUI is an open-source, self-hosted chat interface designed to feel like ChatGPT while giving you full control over which models power it — local models via Ollama, or hosted models through any OpenAI-compatible API. It supports multiple users with permissions, built-in retrieval-augmented generation for chatting with your own documents, and is commonly paired with Ollama as a self-hosted, private alternative to commercial chat assistants.",
    websiteUrl: "https://openwebui.com",
    logoUrl: "https://www.google.com/s2/favicons?domain=openwebui.com&sz=128",
    pricingModel: PricingModel.OPEN_SOURCE,
    features: [
      "Clean, ChatGPT-like chat interface",
      "Works with Ollama and any OpenAI-compatible API",
      "Multi-user support with permissions",
      "Built-in document chat (RAG)",
      "Fully self-hosted — your data stays on your infrastructure",
    ],
    pros: [
      "Free and open-source",
      "Full control over data and hosting",
      "Works with both local and hosted API models",
      "Actively developed with frequent new features",
    ],
    cons: [
      "Requires self-hosting setup (Docker recommended)",
      "No official managed/hosted version",
      "Feature depth depends on which model you connect it to",
    ],
    tags: ["open source", "self-hosted", "chat interface", "privacy", "LLM"],
    useCases: [
      "Self-hosted, private alternative to ChatGPT for individuals or teams",
      "Giving a team a shared chat interface over their own local models",
      "Chatting with your own documents via built-in RAG",
    ],
    alternatives: ["chatgpt", "claude", "gemini"],
    rating: 4.5,
    reviewCount: 2900,
  },
  {
    name: "Jupyter AI",
    slug: "jupyter-ai",
    category: "data-analytics",
    tagline: "Open-source AI assistant built directly into Jupyter notebooks.",
    description:
      "Jupyter AI is an official Project Jupyter extension that brings generative AI directly into the notebook environment you may already use for data work. It adds AI \"magic\" commands you can run inside cells, plus a chat panel alongside your notebook for asking questions about your data or code. It supports a range of model providers — including hosted APIs and local models — so teams already standardized on Jupyter can add AI assistance without adopting a separate tool.",
    websiteUrl: "https://jupyter-ai.readthedocs.io",
    logoUrl: "https://www.google.com/s2/favicons?domain=jupyter.org&sz=128",
    pricingModel: PricingModel.OPEN_SOURCE,
    features: [
      "AI magic commands inside notebook cells",
      "Chat panel alongside your notebook",
      "Supports many model providers, hosted and local",
      "Generate, explain, and fix code inline",
      "Integrates directly into standard JupyterLab",
    ],
    pros: [
      "Free and open-source, backed by Project Jupyter",
      "No new tool to learn if you already use Jupyter",
      "Bring your own model provider",
      "Fits naturally into reproducible, notebook-based workflows",
    ],
    cons: [
      "Only useful if you already work in Jupyter/JupyterLab",
      "Requires your own API key for most hosted models",
      "Less polished natural-language experience than purpose-built tools like Julius AI",
    ],
    tags: ["open source", "data analysis", "Jupyter", "notebooks", "self-hosted"],
    useCases: [
      "AI-assisted data analysis inside an existing Jupyter workflow",
      "Generating and debugging code directly in notebook cells",
      "Teams standardized on Jupyter who want AI without switching tools",
    ],
    alternatives: ["julius-ai", "hex"],
    rating: 4.3,
    reviewCount: 780,
  },
];

async function main() {
  for (const t of tools) {
    const category = await prisma.category.findUnique({ where: { slug: t.category } });
    if (!category) {
      console.warn(`Skipping "${t.slug}" — category "${t.category}" not found.`);
      continue;
    }

    const existingAlternatives = await prisma.tool.findMany({
      where: { slug: { in: t.alternatives } },
      select: { slug: true },
    });
    const foundSlugs = existingAlternatives.map((a) => a.slug);

    const { category: _cat, alternatives: _alts, ...rest } = t;

    await prisma.tool.upsert({
      where: { slug: t.slug },
      update: {
        ...rest,
        categoryId: category.id,
        alternatives: { set: foundSlugs.map((s) => ({ slug: s })) },
      },
      create: {
        ...rest,
        categoryId: category.id,
        alternatives: { connect: foundSlugs.map((s) => ({ slug: s })) },
      },
    });
    console.log(`Upserted: ${t.slug}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
