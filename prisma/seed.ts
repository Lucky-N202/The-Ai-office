import { PrismaClient, PricingModel } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { name: "Writing & Content", slug: "writing-content", icon: "PenLine", color: "#7C3AED", description: "AI copilots for drafting, editing, and polishing written content." },
  { name: "Coding & Dev Tools", slug: "coding-dev-tools", icon: "Code2", color: "#22D3EE", description: "AI pair programmers and dev-workflow accelerators." },
  { name: "Image Generation", slug: "image-generation", icon: "Image", color: "#F472B6", description: "Text-to-image and creative visual generation models." },
  { name: "Video & Motion", slug: "video-motion", icon: "Clapperboard", color: "#FB923C", description: "AI video generation, editing, and avatar tools." },
  { name: "Audio & Voice", slug: "audio-voice", icon: "AudioLines", color: "#34D399", description: "Voice cloning, text-to-speech, and music generation." },
  { name: "Productivity & Agents", slug: "productivity-agents", icon: "Bot", color: "#7C3AED", description: "Autonomous agents and AI-powered workflow assistants." },
  { name: "Data & Analytics", slug: "data-analytics", icon: "BarChart3", color: "#60A5FA", description: "Natural-language data analysis and BI copilots." },
  { name: "Design & UX", slug: "design-ux", icon: "PenTool", color: "#F87171", description: "AI-assisted UI/UX and product design tools." },
  { name: "Customer Support", slug: "customer-support", icon: "Headset", color: "#FBBF24", description: "AI chatbots and helpdesk automation for support teams." },
  { name: "Search & Research", slug: "search-research", icon: "Search", color: "#A78BFA", description: "AI-native search engines and research assistants." },
];

const tools = [
  {
    name: "Claude", slug: "claude", category: "productivity-agents",
    tagline: "Anthropic's family of frontier AI models for reasoning, writing, and coding.",
    description: "Claude is a family of large language models built by Anthropic, designed to be helpful, harmless, and honest. It excels at long-form writing, coding, agentic tool use, and nuanced reasoning across text, images, and documents.",
    websiteUrl: "https://claude.ai", logoUrl: "https://www.google.com/s2/favicons?domain=claude.ai&sz=128",
    pricingModel: PricingModel.FREEMIUM, startingPrice: 20,
    features: ["Extended thinking", "200K+ token context", "Agentic tool use", "Artifacts & code execution", "Vision & document understanding"],
    pros: ["Exceptional writing quality", "Strong safety alignment", "Great at long documents"],
    cons: ["No native image generation", "Usage limits on free tier"],
    tags: ["LLM", "chatbot", "reasoning", "agents"], rating: 4.8, reviewCount: 3120, featured: true,
  },
  {
    name: "ChatGPT", slug: "chatgpt", category: "productivity-agents",
    tagline: "OpenAI's conversational AI assistant powering GPT models.",
    description: "ChatGPT is OpenAI's flagship conversational assistant, supporting text, voice, image, and file input with plugin and custom GPT ecosystems for extending its capabilities.",
    websiteUrl: "https://chat.openai.com", logoUrl: "https://www.google.com/s2/favicons?domain=openai.com&sz=128",
    pricingModel: PricingModel.FREEMIUM, startingPrice: 20,
    features: ["Custom GPTs", "Voice mode", "Web browsing", "Code Interpreter", "Image generation via DALL·E"],
    pros: ["Huge plugin ecosystem", "Multimodal input", "Fast iteration cadence"],
    cons: ["Inconsistent long-context recall", "Rate limits on free tier"],
    tags: ["LLM", "chatbot", "multimodal"], rating: 4.6, reviewCount: 15230, featured: true,
  },
  {
    name: "Gemini", slug: "gemini", category: "productivity-agents",
    tagline: "Google's multimodal AI assistant integrated across Workspace.",
    description: "Gemini is Google's family of multimodal models, deeply integrated into Search, Workspace, and Android, with strong native support for text, image, audio, and video reasoning.",
    websiteUrl: "https://gemini.google.com", logoUrl: "https://www.google.com/s2/favicons?domain=google.com&sz=128",
    pricingModel: PricingModel.FREEMIUM, startingPrice: 19.99,
    features: ["1M+ token context", "Native multimodality", "Workspace integration", "Deep Research mode"],
    pros: ["Massive context window", "Tight Google integration", "Strong video understanding"],
    cons: ["Occasional inconsistency in reasoning", "Feature rollout varies by region"],
    tags: ["LLM", "multimodal", "google"], rating: 4.5, reviewCount: 8420,
  },
  {
    name: "GitHub Copilot", slug: "github-copilot", category: "coding-dev-tools",
    tagline: "AI pair programmer built into your editor.",
    description: "GitHub Copilot provides real-time code suggestions, chat-based debugging, and whole-repo context awareness directly inside VS Code, JetBrains IDEs, and Neovim.",
    websiteUrl: "https://github.com/features/copilot", logoUrl: "https://www.google.com/s2/favicons?domain=github.com&sz=128",
    pricingModel: PricingModel.PAID, startingPrice: 10,
    features: ["Inline code completion", "Copilot Chat", "PR summaries", "CLI suggestions", "Workspace-aware agent mode"],
    pros: ["Deep IDE integration", "Great autocomplete latency", "Strong GitHub ecosystem tie-in"],
    cons: ["Can suggest outdated patterns", "Requires subscription for full features"],
    tags: ["coding", "IDE", "autocomplete"], rating: 4.6, reviewCount: 9840, featured: true,
  },
  {
    name: "Cursor", slug: "cursor", category: "coding-dev-tools",
    tagline: "The AI-first code editor built for pair programming with LLMs.",
    description: "Cursor is a VS Code fork rebuilt around AI-native workflows, offering multi-file editing, codebase-aware chat, and an agent mode that can plan and execute large refactors.",
    websiteUrl: "https://cursor.com", logoUrl: "https://www.google.com/s2/favicons?domain=cursor.com&sz=128",
    pricingModel: PricingModel.FREEMIUM, startingPrice: 20,
    features: ["Multi-file agent edits", "Codebase-wide chat", "Tab autocomplete", "Terminal AI"],
    pros: ["Excellent agentic refactors", "Familiar VS Code UX", "Fast model switching"],
    cons: ["Compute-heavy on large repos", "Pricing scales with usage"],
    tags: ["coding", "IDE", "agents"], rating: 4.7, reviewCount: 5210, featured: true,
  },
  {
    name: "Replit Agent", slug: "replit-agent", category: "coding-dev-tools",
    tagline: "Build and deploy full apps from a prompt, in the browser.",
    description: "Replit Agent turns natural-language prompts into working full-stack applications, handling scaffolding, dependency installation, and deployment inside Replit's cloud IDE.",
    websiteUrl: "https://replit.com/ai", logoUrl: "https://www.google.com/s2/favicons?domain=replit.com&sz=128",
    pricingModel: PricingModel.FREEMIUM, startingPrice: 25,
    features: ["Prompt-to-app scaffolding", "Built-in hosting", "Database provisioning", "Collaborative editing"],
    pros: ["Zero local setup", "Fast prototyping", "One-click deploy"],
    cons: ["Less control over architecture", "Can rack up compute costs"],
    tags: ["coding", "no-code", "deployment"], rating: 4.3, reviewCount: 2870,
  },
  {
    name: "Midjourney", slug: "midjourney", category: "image-generation",
    tagline: "The gold standard for stylized, artistic AI image generation.",
    description: "Midjourney generates highly stylized, painterly images from text prompts via Discord and a web app, prized by designers and artists for its aesthetic quality.",
    websiteUrl: "https://midjourney.com", logoUrl: "https://www.google.com/s2/favicons?domain=midjourney.com&sz=128",
    pricingModel: PricingModel.PAID, startingPrice: 10,
    features: ["Style references", "Character consistency", "Upscaling & variations", "Web-based generation"],
    pros: ["Best-in-class aesthetics", "Strong community & prompt library", "Fast iteration"],
    cons: ["No free tier", "Limited fine-grained control vs ComfyUI"],
    tags: ["image", "art", "generative"], rating: 4.7, reviewCount: 12400, featured: true,
  },
  {
    name: "DALL·E 3", slug: "dalle-3", category: "image-generation",
    tagline: "OpenAI's text-to-image model with tight prompt adherence.",
    description: "DALL·E 3 is OpenAI's image generation model, integrated directly into ChatGPT, known for accurately following complex, detailed prompts and rendering text within images.",
    websiteUrl: "https://openai.com/dall-e-3", logoUrl: "https://www.google.com/s2/favicons?domain=openai.com&sz=128",
    pricingModel: PricingModel.PAID, startingPrice: 20,
    features: ["ChatGPT integration", "High prompt fidelity", "In-image text rendering", "Inpainting"],
    pros: ["Excellent prompt adherence", "Easy conversational refinement"],
    cons: ["Less stylistic range than Midjourney", "Usage caps"],
    tags: ["image", "generative", "openai"], rating: 4.4, reviewCount: 6300,
  },
  {
    name: "Stable Diffusion", slug: "stable-diffusion", category: "image-generation",
    tagline: "Open-source, self-hostable text-to-image diffusion model.",
    description: "Stable Diffusion is an open-weight diffusion model from Stability AI that can be run locally or fine-tuned, powering a huge ecosystem of tools like ComfyUI and Automatic1111.",
    websiteUrl: "https://stability.ai", logoUrl: "https://www.google.com/s2/favicons?domain=stability.ai&sz=128",
    pricingModel: PricingModel.OPEN_SOURCE,
    features: ["Open weights", "Local inference", "Custom LoRA fine-tuning", "ControlNet support"],
    pros: ["Full control & privacy", "Free to self-host", "Massive plugin ecosystem"],
    cons: ["Requires GPU for local use", "Steeper learning curve"],
    tags: ["image", "open-source", "self-hosted"], rating: 4.5, reviewCount: 7100,
  },
  {
    name: "Runway", slug: "runway", category: "video-motion",
    tagline: "AI video generation and editing suite for creators.",
    description: "Runway offers text-to-video and image-to-video generation (Gen-3) alongside a full AI-powered video editing suite, including motion tracking, green screen, and inpainting.",
    websiteUrl: "https://runwayml.com", logoUrl: "https://www.google.com/s2/favicons?domain=runwayml.com&sz=128",
    pricingModel: PricingModel.FREEMIUM, startingPrice: 15,
    features: ["Gen-3 text-to-video", "Motion brush", "Green screen AI", "Frame interpolation"],
    pros: ["Cutting-edge video quality", "Full creative suite, not just generation"],
    cons: ["Credit system can be expensive", "Generation times vary"],
    tags: ["video", "generative", "editing"], rating: 4.5, reviewCount: 4120, featured: true,
  },
  {
    name: "Synthesia", slug: "synthesia", category: "video-motion",
    tagline: "Turn text scripts into videos with AI avatars in minutes.",
    description: "Synthesia generates professional talking-head videos from text scripts using AI avatars and voices, widely used for corporate training and marketing content.",
    websiteUrl: "https://synthesia.io", logoUrl: "https://www.google.com/s2/favicons?domain=synthesia.io&sz=128",
    pricingModel: PricingModel.PAID, startingPrice: 29,
    features: ["150+ AI avatars", "120+ languages", "Custom avatar creation", "Screen recording"],
    pros: ["No filming required", "Fast localization", "Enterprise-ready"],
    cons: ["Avatars can look uncanny", "No free tier for commercial use"],
    tags: ["video", "avatars", "enterprise"], rating: 4.4, reviewCount: 3050,
  },
  {
    name: "ElevenLabs", slug: "elevenlabs", category: "audio-voice",
    tagline: "The most realistic AI voice generation and cloning platform.",
    description: "ElevenLabs provides ultra-realistic text-to-speech, voice cloning, and dubbing across 30+ languages, used widely in podcasting, audiobooks, and game development.",
    websiteUrl: "https://elevenlabs.io", logoUrl: "https://www.google.com/s2/favicons?domain=elevenlabs.io&sz=128",
    pricingModel: PricingModel.FREEMIUM, startingPrice: 5,
    features: ["Voice cloning", "Multilingual dubbing", "Low-latency streaming API", "Voice library"],
    pros: ["Extremely natural voices", "Fast API for real-time apps", "Generous free tier"],
    cons: ["Cloning quality depends on sample audio", "Costs scale with volume"],
    tags: ["audio", "voice", "TTS"], rating: 4.8, reviewCount: 6790, featured: true,
  },
  {
    name: "Suno", slug: "suno", category: "audio-voice",
    tagline: "Generate full songs with vocals from a text prompt.",
    description: "Suno generates complete songs — lyrics, vocals, and instrumentation — from short text prompts, making music creation accessible to non-musicians.",
    websiteUrl: "https://suno.com", logoUrl: "https://www.google.com/s2/favicons?domain=suno.com&sz=128",
    pricingModel: PricingModel.FREEMIUM, startingPrice: 10,
    features: ["Full song generation", "Custom lyrics mode", "Stem separation", "Style remixing"],
    pros: ["Surprisingly coherent songs", "Fun and fast to use", "Free tier available"],
    cons: ["Commercial rights require paid plan", "Ongoing copyright debate"],
    tags: ["audio", "music", "generative"], rating: 4.3, reviewCount: 2980,
  },
  {
    name: "Jasper", slug: "jasper", category: "writing-content",
    tagline: "AI content platform built for marketing teams.",
    description: "Jasper is an enterprise-focused AI writing platform with brand voice controls, campaign workflows, and integrations built specifically for marketing and content teams.",
    websiteUrl: "https://jasper.ai", logoUrl: "https://www.google.com/s2/favicons?domain=jasper.ai&sz=128",
    pricingModel: PricingModel.PAID, startingPrice: 39,
    features: ["Brand voice memory", "Campaign templates", "SEO mode", "Team workflows"],
    pros: ["Purpose-built for marketing teams", "Strong brand consistency tools"],
    cons: ["Pricier than general chatbots", "Overkill for solo writers"],
    tags: ["writing", "marketing", "SEO"], rating: 4.2, reviewCount: 3410,
  },
  {
    name: "Grammarly", slug: "grammarly", category: "writing-content",
    tagline: "AI writing assistant for grammar, tone, and clarity.",
    description: "Grammarly checks grammar, spelling, tone, and clarity in real time across browsers, desktop apps, and Office/Google integrations, with generative rewrite suggestions.",
    websiteUrl: "https://grammarly.com", logoUrl: "https://www.google.com/s2/favicons?domain=grammarly.com&sz=128",
    pricingModel: PricingModel.FREEMIUM, startingPrice: 12,
    features: ["Real-time grammar checks", "Tone detection", "Generative rewrites", "Plagiarism detection"],
    pros: ["Works everywhere you type", "Very low friction", "Strong free tier"],
    cons: ["Generative features feel bolted-on", "Enterprise pricing is steep"],
    tags: ["writing", "grammar", "editing"], rating: 4.5, reviewCount: 21400,
  },
  {
    name: "Notion AI", slug: "notion-ai", category: "productivity-agents",
    tagline: "AI writing and Q&A built directly into your Notion workspace.",
    description: "Notion AI adds generative writing, summarization, translation, and workspace-wide Q&A directly inside Notion docs, wikis, and databases.",
    websiteUrl: "https://notion.so/product/ai", logoUrl: "https://www.google.com/s2/favicons?domain=notion.so&sz=128",
    pricingModel: PricingModel.PAID, startingPrice: 10,
    features: ["In-doc generation", "Workspace Q&A", "Meeting notes", "Autofill databases"],
    pros: ["Seamless in existing Notion workflow", "Good for meeting/notes summarization"],
    cons: ["Add-on pricing on top of Notion plan", "Less powerful standalone"],
    tags: ["productivity", "notes", "workspace"], rating: 4.3, reviewCount: 5680,
  },
  {
    name: "Perplexity", slug: "perplexity", category: "search-research",
    tagline: "Answer engine that cites sources for every claim.",
    description: "Perplexity is an AI-native search engine that answers questions conversationally while citing sources inline, with focus modes for academic, video, and social search.",
    websiteUrl: "https://perplexity.ai", logoUrl: "https://www.google.com/s2/favicons?domain=perplexity.ai&sz=128",
    pricingModel: PricingModel.FREEMIUM, startingPrice: 20,
    features: ["Inline citations", "Focus modes", "Pro Search multi-step reasoning", "File upload Q&A"],
    pros: ["Trustworthy sourcing", "Fast, clean answers", "Great free tier"],
    cons: ["Can miss nuance on complex topics", "Pro model quality varies by selection"],
    tags: ["search", "research", "citations"], rating: 4.6, reviewCount: 4890, featured: true,
  },
  {
    name: "Elicit", slug: "elicit", category: "search-research",
    tagline: "AI research assistant for finding and synthesizing academic papers.",
    description: "Elicit automates literature review workflows — finding relevant papers, extracting key findings, and synthesizing evidence tables — for researchers and analysts.",
    websiteUrl: "https://elicit.com", logoUrl: "https://www.google.com/s2/favicons?domain=elicit.com&sz=128",
    pricingModel: PricingModel.FREEMIUM, startingPrice: 12,
    features: ["Systematic review automation", "Evidence extraction tables", "Semantic paper search", "Data extraction"],
    pros: ["Huge time saver for literature reviews", "Transparent extraction sourcing"],
    cons: ["Narrow academic focus", "Learning curve for new users"],
    tags: ["research", "academic", "papers"], rating: 4.4, reviewCount: 1240,
  },
  {
    name: "Julius AI", slug: "julius-ai", category: "data-analytics",
    tagline: "Chat with your data — no formulas or code required.",
    description: "Julius AI lets users upload spreadsheets or connect databases and ask natural-language questions, generating charts, statistical analysis, and forecasts on demand.",
    websiteUrl: "https://julius.ai", logoUrl: "https://www.google.com/s2/favicons?domain=julius.ai&sz=128",
    pricingModel: PricingModel.FREEMIUM, startingPrice: 20,
    features: ["Natural-language queries", "Auto chart generation", "Statistical modeling", "CSV/Excel/DB connectors"],
    pros: ["Very approachable for non-analysts", "Fast chart iteration"],
    cons: ["Struggles with very large datasets", "Limited advanced statistics"],
    tags: ["data", "analytics", "BI"], rating: 4.3, reviewCount: 1870,
  },
  {
    name: "Hex", slug: "hex", category: "data-analytics",
    tagline: "Collaborative AI-powered notebooks for data teams.",
    description: "Hex combines SQL, Python, and no-code cells in collaborative notebooks with an AI agent that can write queries, build charts, and explain results for data teams.",
    websiteUrl: "https://hex.tech", logoUrl: "https://www.google.com/s2/favicons?domain=hex.tech&sz=128",
    pricingModel: PricingModel.FREEMIUM, startingPrice: 36,
    features: ["AI SQL/Python generation", "Interactive apps from notebooks", "Semantic model integration", "Team collaboration"],
    pros: ["Powerful for technical data teams", "Great notebook-to-app workflow"],
    cons: ["Overkill for casual users", "Enterprise pricing tiers"],
    tags: ["data", "notebooks", "SQL"], rating: 4.5, reviewCount: 980,
  },
  {
    name: "Figma AI", slug: "figma-ai", category: "design-ux",
    tagline: "Generative design tools built into Figma.",
    description: "Figma AI brings generative layout, image, and content tools directly into the Figma design canvas, including auto-layout suggestions and asset generation.",
    websiteUrl: "https://figma.com/ai", logoUrl: "https://www.google.com/s2/favicons?domain=figma.com&sz=128",
    pricingModel: PricingModel.FREEMIUM, startingPrice: 0,
    features: ["Auto layout suggestions", "Content-aware fill", "Text-to-design drafts", "Asset search"],
    pros: ["Native to existing design workflow", "No context switching"],
    cons: ["Feature availability varies by plan", "Still early compared to standalone tools"],
    tags: ["design", "UI", "figma"], rating: 4.4, reviewCount: 3210,
  },
  {
    name: "Galileo AI", slug: "galileo-ai", category: "design-ux",
    tagline: "Generate editable UI designs from a text prompt.",
    description: "Galileo AI turns short text prompts into fully editable, high-fidelity UI designs that can be imported directly into Figma, accelerating early-stage product design.",
    websiteUrl: "https://usegalileo.ai", logoUrl: "https://www.google.com/s2/favicons?domain=usegalileo.ai&sz=128",
    pricingModel: PricingModel.PAID, startingPrice: 20,
    features: ["Prompt-to-UI generation", "Figma export", "Design system awareness", "Multiple style variants"],
    pros: ["Great for rapid ideation", "Editable, not just images"],
    cons: ["Output needs polish for production", "Limited free usage"],
    tags: ["design", "UI", "prototyping"], rating: 4.1, reviewCount: 640,
  },
  {
    name: "Intercom Fin", slug: "intercom-fin", category: "customer-support",
    tagline: "AI agent that resolves customer support tickets autonomously.",
    description: "Fin is Intercom's AI customer service agent, trained on your help center to resolve support tickets autonomously and hand off complex cases to human agents seamlessly.",
    websiteUrl: "https://intercom.com/fin", logoUrl: "https://www.google.com/s2/favicons?domain=intercom.com&sz=128",
    pricingModel: PricingModel.PAID, startingPrice: 0.99,
    features: ["Autonomous resolution", "Help-center training", "Multi-channel support", "Human handoff"],
    pros: ["Pay-per-resolution pricing", "Strong resolution accuracy", "Deep Intercom integration"],
    cons: ["Requires Intercom platform", "Cost scales with support volume"],
    tags: ["support", "chatbot", "enterprise"], rating: 4.4, reviewCount: 1560,
  },
  {
    name: "Zendesk AI", slug: "zendesk-ai", category: "customer-support",
    tagline: "AI-powered ticket triage and agent assistance for support teams.",
    description: "Zendesk AI automates ticket routing, sentiment analysis, and reply suggestions, plus a customer-facing bot that resolves common requests before reaching a human agent.",
    websiteUrl: "https://zendesk.com/service/ai", logoUrl: "https://www.google.com/s2/favicons?domain=zendesk.com&sz=128",
    pricingModel: PricingModel.ENTERPRISE,
    features: ["Intelligent triage", "Agent copilot", "Customer-facing bots", "Sentiment analysis"],
    pros: ["Mature enterprise support suite", "Strong analytics"],
    cons: ["Enterprise-only pricing for full AI suite", "Setup complexity"],
    tags: ["support", "enterprise", "triage"], rating: 4.2, reviewCount: 2140,
  },
];

async function main() {
  console.log("Seeding categories...");
  const categoryMap = new Map<string, string>();
  for (const c of categories) {
    const created = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, icon: c.icon, color: c.color },
      create: c,
    });
    categoryMap.set(c.slug, created.id);
  }

  console.log("Seeding tools...");
  for (const t of tools) {
    const { category, ...rest } = t;
    const categoryId = categoryMap.get(category);
    if (!categoryId) throw new Error(`Unknown category slug: ${category}`);
    await prisma.tool.upsert({
      where: { slug: t.slug },
      update: { ...rest, categoryId },
      create: { ...rest, categoryId },
    });
  }

  console.log(`Seeded ${categories.length} categories and ${tools.length} tools.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
