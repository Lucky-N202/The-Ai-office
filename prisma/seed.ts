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
    description: "Claude is Anthropic's family of large language models, built with a stated focus on being helpful, harmless, and honest. It's designed for long-form writing and editing, complex reasoning, and agentic workflows where the model plans multi-step tasks and calls external tools on its own. Claude supports very large context windows, letting it work with entire codebases, lengthy legal documents, or full books in a single conversation without losing track of earlier details. It also handles vision input (reading screenshots, diagrams, and scanned documents) and can execute code and generate interactive artifacts directly inside a conversation. Claude is available through a consumer chat interface, a developer API, and enterprise platforms including Amazon Bedrock and Google Cloud Vertex AI.",
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
    description: "ChatGPT is OpenAI's conversational AI assistant and the product that first brought large language models to mainstream, everyday use. It supports text, voice, image, and file input, and can browse the web, run code in a sandboxed environment, and generate images through integrated DALL·E access. A key differentiator is its Custom GPTs system, which lets users and businesses build specialized versions of the assistant configured with their own instructions, knowledge files, and connected tools, then share or sell them through OpenAI's GPT Store. ChatGPT is available as a free tier with usage limits and paid Plus, Team, and Enterprise tiers that unlock higher limits, priority access to newer models, and admin controls.",
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
    description: "Gemini is Google's family of multimodal AI models, built from the ground up to natively understand text, images, audio, and video together rather than bolting on separate systems for each. It's deeply woven into Google's own ecosystem, appearing inside Search, Gmail, Docs, Sheets, and Android, so users often encounter it without opening a separate app. Gemini supports very large context windows, which is particularly useful for tasks like summarizing long meeting recordings or analyzing an entire video file frame by frame. Its Deep Research mode can autonomously browse dozens of sources and compile a structured report, and its tight integration with Google Workspace makes it a natural fit for teams already living in Google's tools.",
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
    description: "GitHub Copilot is an AI pair programmer that integrates directly into popular editors including VS Code, JetBrains IDEs, and Neovim, offering real-time inline code suggestions as developers type. Beyond autocomplete, its Copilot Chat feature answers questions about a codebase in natural language, helps debug errors, and can explain unfamiliar code. Copilot's agent mode can plan and execute larger, multi-file changes, and it also generates pull request summaries and offers command-line suggestions in the terminal. Because it's built by GitHub and owned by Microsoft, it has particularly deep integration with the broader GitHub workflow, including issues, pull requests, and Actions.",
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
    description: "Cursor is a code editor built as a fork of VS Code, redesigned from the ground up around AI-assisted development rather than treating AI as a bolt-on feature. Its standout capability is multi-file agentic editing: developers can describe a change in natural language and Cursor will plan, edit, and verify changes across an entire codebase, not just a single file. It offers codebase-wide chat that understands project context, fast Tab-based autocomplete that predicts multi-line edits, and an integrated terminal with AI assistance. Because it's a full VS Code fork, existing extensions, themes, and keybindings carry over, which keeps the learning curve low for developers switching from VS Code.",
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
    description: "Replit Agent turns natural-language prompts into working full-stack applications entirely inside the browser, handling project scaffolding, dependency installation, database provisioning, and deployment without requiring any local development environment. It's built on top of Replit's existing cloud IDE, so generated projects are immediately live, shareable, and editable by multiple collaborators in real time. This makes it especially well suited to fast prototyping, internal tools, and small business applications where getting from idea to a working, hosted app quickly matters more than fine-grained architectural control. Because everything runs in Replit's cloud, there's no environment setup, but ongoing compute and hosting costs scale with usage.",
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
    description: "Midjourney is a text-to-image generation model known for producing highly stylized, painterly, and often strikingly artistic output, which has made it a favorite among illustrators, concept artists, and designers. It's accessed through a web app (originally exclusively via Discord, which remains a major hub for its community), where users type prompts and receive four image variations to upscale or remix. Midjourney supports style references that let users guide the aesthetic using an existing image, character reference features for keeping a character consistent across multiple generations, and fine-grained parameters for aspect ratio, stylization strength, and more. It's a paid-only product with no permanently free tier, reflecting its positioning toward professional and hobbyist creative use rather than casual experimentation.",
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
    description: "DALL·E 3 is OpenAI's text-to-image model, notable for unusually strong prompt adherence — it tends to accurately render complex scenes with multiple specific objects, spatial relationships, and even legible text within the image, areas where earlier image models often struggled. It's tightly integrated into ChatGPT, so users can refine an image through natural conversation rather than needing to master prompt-engineering syntax, describing changes in plain language and getting an updated version. DALL·E 3 also supports inpainting, letting users select and regenerate specific regions of an image while leaving the rest untouched. Access is bundled into ChatGPT Plus and Team subscriptions rather than sold as a fully separate product.",
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
    description: "Stable Diffusion is an open-weight text-to-image diffusion model from Stability AI, distinguished from most other image generators by the fact that its model weights are publicly available and can be downloaded and run entirely on a user's own hardware. This has made it the foundation for a large ecosystem of community tools, most notably ComfyUI and Automatic1111, which add node-based workflows, inpainting, upscaling, and fine-tuning interfaces on top of the base model. Because it can be self-hosted, it offers a degree of privacy and cost control unavailable with closed, API-only image generators, and its open nature has enabled a large library of community-trained LoRA fine-tunes for specific styles and subjects. The tradeoff is a steeper learning curve and the need for a capable GPU for reasonable local generation speed.",
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
    description: "Runway is an AI video platform combining text-to-video and image-to-video generation (its Gen-series models) with a full suite of AI-powered video editing tools built for working with existing footage, not just generating new clips. Its editing features include a motion brush for animating specific parts of an image, AI-powered green screen removal that doesn't require an actual green screen, and frame interpolation for smooth slow motion. This combination — generation plus editing — sets it apart from pure text-to-video generators, positioning it as a tool that fits into a professional video production pipeline rather than a standalone novelty generator. Runway is used by independent filmmakers, VFX artists, and marketing teams producing short-form video content.",
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
    description: "Synthesia generates professional-looking talking-head videos from a text script alone, using a library of over 150 diverse AI avatars and support for more than 120 languages, without requiring any camera, microphone, or on-camera talent. It's widely used for corporate training videos, product explainers, and localized marketing content, where the same script can be quickly turned into videos in dozens of languages for a global audience. Beyond its stock avatar library, Synthesia supports creating a custom avatar modeled on a real person (with their consent), useful for companies that want consistent, on-brand presenters across many videos. It also includes screen recording tools for combining a talking avatar with software walkthroughs, a common need in training content.",
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
    description: "ElevenLabs specializes in AI voice technology, offering text-to-speech that's widely regarded as among the most natural and human-sounding available, alongside voice cloning that can recreate a specific voice from a short sample audio clip. Its dubbing tools automatically translate and re-voice audio and video content across 30-plus languages while preserving the original speaker's vocal characteristics and emotional tone. ElevenLabs offers a low-latency streaming API well suited to real-time applications like voice agents and interactive characters, alongside a public voice library where users can browse and license voices created by others. It's used across podcasting, audiobook production, game development, and accessibility tools, with a genuinely usable free tier before paid plans are needed.",
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
    description: "Suno generates complete songs — including lyrics, vocals, and full instrumentation — from a short text prompt, making music production accessible to people with no musical training or instruments. Users can describe a genre, mood, and subject matter and receive a finished track in under a minute, or supply their own lyrics for the model to set to music in a chosen style. Suno also offers stem separation, letting users pull apart a generated song into individual instrument and vocal tracks for further editing in a traditional digital audio workstation, and a remixing feature for reworking existing generations into new styles. Commercial usage rights require a paid plan, and the use of AI-generated music remains an active legal and ethical debate within the music industry.",
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
    description: "Jasper is an AI content platform built specifically for marketing teams rather than general-purpose writing, with features oriented around maintaining brand consistency across a large volume of content. Its brand voice system lets a team define tone, vocabulary, and style guidelines once, and Jasper applies them automatically across every piece of generated content afterward. It includes campaign-oriented templates for common marketing formats — ad copy, email sequences, landing pages — an SEO mode that factors in target keywords while drafting, and team collaboration workflows for review and approval. Jasper's pricing and feature set are oriented toward companies with dedicated marketing functions rather than individual writers or small teams.",
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
    description: "Grammarly is a writing assistant that checks grammar, spelling, tone, and clarity in real time as people type, and it works essentially everywhere — as a browser extension, a desktop app, and native integrations with Microsoft Office and Google Docs — rather than requiring text to be copied into a separate tool. Beyond traditional proofreading, it detects tone (flagging text that might read as harsh or overly casual for its context) and offers generative rewrite suggestions that can adjust the length, formality, or clarity of a passage on demand. Grammarly also includes plagiarism detection for academic and professional writing. Its free tier covers core grammar and spelling checks, with paid tiers adding advanced tone detection, generative features, and business-oriented style guides.",
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
    description: "Notion AI is built directly into Notion's workspace and notes platform, adding generative writing, summarization, translation, and question-answering that operates on a team's own existing content rather than being a separate, disconnected chat tool. Its workspace Q&A feature can answer questions by searching across a team's Notion pages, databases, and wikis, surfacing information that might otherwise require manually digging through nested pages. It also automatically summarizes meeting notes, drafts first passes of documents inside the editor, and can autofill values into database properties based on the content of linked pages. Because it lives inside the tool teams are often already using for documentation and project tracking, it avoids the context-switching cost of a separate AI app, though it's sold as an add-on on top of a standard Notion subscription.",
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
    description: "Perplexity is an AI-native answer engine that responds to questions conversationally while citing its sources inline, functioning as an alternative to traditional search for people who want a synthesized answer with visible provenance rather than a list of links to sort through themselves. It offers several specialized focus modes — including academic search restricted to scholarly sources, and video and social search — plus a Pro Search mode that performs multi-step reasoning, breaking a complex question into sub-questions and researching each before compiling a final answer. Users can also upload files and ask questions directly about their content. Perplexity's citation-first approach has made it particularly popular for research and fact-checking tasks where knowing the source matters as much as the answer itself.",
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
    description: "Elicit is a research assistant purpose-built for academic literature review, automating the time-consuming parts of finding, reading, and synthesizing research papers. Given a research question, it performs semantic search across a large corpus of academic literature (going beyond simple keyword matching to find conceptually related papers), then extracts key findings, methodologies, and data points from each result into structured, comparable evidence tables. This lets researchers survey dozens of papers in the time it would normally take to carefully read two or three. Elicit is narrowly focused on academic and scientific use cases rather than general research, and its extraction-with-sourcing approach is designed so users can verify every claim against the original paper rather than trusting a black-box summary.",
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
    description: "Julius AI lets people analyze data by asking questions in plain English rather than writing spreadsheet formulas or code, aimed at users who need real data analysis but aren't trained analysts or engineers. After uploading a CSV or Excel file, or connecting a database, users can ask things like \"what's driving the drop in Q3 revenue\" and Julius will generate the relevant chart, run the underlying statistical calculation, and explain the result in plain language. It supports iterative follow-up questions, letting users drill into an initial finding without starting over, and can build simple forecasting models from historical data. It's best suited to small-to-mid-sized datasets and straightforward analysis; very large datasets or advanced statistical methods are better served by dedicated data science tooling.",
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
    description: "Hex is a collaborative data notebook platform that combines SQL, Python, and no-code cells in a single document, aimed at data teams who need more technical depth than a chat-based analytics tool but still want a fast, shareable workflow. Its AI agent can write SQL queries and Python analysis code from a natural-language request, explain what an existing block of code does, and suggest appropriate chart types for a given result. A key feature is turning a finished notebook directly into an interactive internal app or dashboard that non-technical stakeholders can use, without needing to rebuild the analysis in a separate BI tool. Hex integrates with a company's existing semantic data model, making it more suited to data teams already invested in structured data infrastructure than to solo, ad-hoc analysis.",
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
    description: "Figma AI brings generative design capabilities directly into the Figma canvas that designers already use for interface design, rather than requiring a separate AI tool and a copy-paste workflow between them. It offers auto-layout suggestions that can restructure a messy frame into a properly responsive layout, content-aware fill for extending or patching image assets, and rough first-draft generation from a text description of a screen or component. It also includes AI-powered asset search across Figma's community files. Because these features are built into the core Figma product, exact availability varies by plan tier, and Figma AI is generally best understood as an assistive layer on an existing design workflow rather than a tool for generating a finished design from scratch.",
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
    description: "Galileo AI generates high-fidelity, fully editable user interface designs from a short text prompt, aimed at the earliest stage of product design when teams need to explore direction quickly rather than starting from a blank canvas. Unlike image-generation tools that produce a picture of an interface, Galileo's output is composed of real, editable design layers that export directly into Figma, so designers can immediately adjust spacing, swap components, and apply their own design system on top of the generated starting point. It can produce multiple stylistic variants from a single prompt and has some awareness of common design-system conventions. It's best suited to rapid ideation and early concepting; output generally needs further refinement before it's production-ready.",
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
    description: "Fin is Intercom's AI customer service agent, trained on a company's own help center and support documentation to autonomously resolve customer support tickets without human involvement, escalating to a live agent only when it can't confidently answer. It operates across multiple channels — chat widget, email, and messaging apps — and is designed to hand off conversations to human agents seamlessly, preserving full context so customers don't have to repeat themselves. Fin is priced per successful resolution rather than as a flat subscription, meaning cost scales directly with how much support volume it actually handles rather than seat count. Because it requires Intercom's broader customer service platform, it's best suited to companies already using or willing to adopt Intercom rather than as a standalone bolt-on.",
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
    description: "Zendesk AI adds AI-powered ticket triage, agent assistance, and customer-facing automation on top of Zendesk's established customer service platform. It automatically routes incoming tickets to the right team or agent based on content and urgency, performs sentiment analysis to flag frustrated customers for priority handling, and suggests draft replies for human agents to review and send rather than fully autonomous resolution in most configurations. A customer-facing bot handles common, repetitive requests before a ticket ever reaches a human queue. Zendesk AI's full capabilities are generally available at the enterprise pricing tier, and — like Intercom Fin — it requires the underlying Zendesk platform, making it best suited to organizations already standardized on Zendesk for support.",
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

const articles = [
  {
    title: "Claude Sonnet 5 Is Now the Default Across Every Claude Plan",
    slug: "claude-sonnet-5-default-across-claude-plans",
    excerpt: "Anthropic made Sonnet 5 the default model for all Claude plans on June 30, 2026, with introductory pricing running through the end of August — here's what changed and what to watch for if you're building on the API.",
    content: `Anthropic made Claude Sonnet 5 the default model across every Claude plan on June 30, 2026 — free, Pro, and Max tiers alike now route to it automatically rather than requiring users to manually select it. For a directory that lists [Claude](/browse/tools/claude) as one of its most-compared AI assistants, this is worth flagging on its own: the model most people encounter when they open Claude today is materially different from what was default just a few months earlier.

## What's actually new

Early adoption reports point to Sonnet 5 as a clear step up specifically for coding, debugging, and multi-step agentic work — the kind of task where a model has to plan several actions ahead and keep track of state across them, rather than answer a single, self-contained question. Insurtech company Pace has reportedly put it into live production for multi-step insurance workflows, including intake and claims setup — a meaningful signal, since running an AI model on live business systems (rather than a demo or pilot) is a higher bar than most model announcements clear.

## The pricing window

Anthropic introduced Sonnet 5 at introductory API pricing of $2 per million input tokens and $10 per million output tokens, running through August 31, 2026. If you're evaluating models for a new project, this is a reasonable window to test Sonnet 5 against whatever you're currently using, since the intro pricing won't last indefinitely.

## One thing worth knowing if you build on the API

Sonnet 5 removed the \`temperature\` and \`top_p\` parameters that were available on earlier Claude models. If you have existing code that sets either of these, expect API errors until you remove them — a small thing, but the kind of detail that's easy to miss when upgrading and then confusing to debug after the fact.

## Why this matters if you're choosing between assistants

Model updates like this are exactly why we track tools continuously rather than treating a listing as a one-time writeup — the Claude you'd be evaluating today isn't the same product it was two months ago. If coding and multi-step task automation are your primary use case, this is a good moment to actually re-test Claude against whatever you're currently using, rather than relying on an older impression.`,
  },
  {
    title: "Google's Gemini 3.6 Flash Lineup: What's New and What It Costs",
    slug: "gemini-3-6-flash-lineup-pricing",
    excerpt: "Google shipped Gemini 3.6 Flash alongside a cheaper 3.5 Flash-Lite tier this July, with built-in computer-use capability and better token efficiency — while the flagship 3.5 Pro remains delayed.",
    content: `Google expanded its [Gemini](/browse/tools/gemini) lineup in late July 2026 with Gemini 3.6 Flash, positioned as the new mid-tier workhorse model, alongside a cheaper 3.5 Flash-Lite variant aimed at high-volume, cost-sensitive use cases.

## What shipped

Gemini 3.6 Flash is priced at $1.50 per million input tokens and $7.50 per million output tokens, and Google reports it's roughly 17% more token-efficient than its predecessor — meaning a given task should consume fewer tokens to complete, which matters as much for real-world cost as the sticker price per token does. It ships with computer-use capability built in, letting the model directly interact with a screen or interface rather than only producing text output for a separate system to act on.

Alongside it, Google launched 3.5 Flash-Lite at $0.30 per million input tokens and $2.50 per million output tokens — a notably cheaper option clearly aimed at applications running a very high volume of simple requests, where the flagship model's extra capability isn't worth its extra cost.

## What's still missing

Gemini 3.5 Pro, the flagship-tier successor many were expecting, remains delayed as of this writing. For a company that leans heavily on tight integration across Search, Workspace, and Android as a differentiator, a delayed flagship model is a real gap in the lineup — the Flash tier is designed for cost-efficient volume, not for the hardest reasoning tasks a Pro-tier model would normally handle.

## What this means if you're choosing a model

If your use case is high-volume and cost-sensitive, 3.5 Flash-Lite is worth benchmarking against whatever you're currently using for that workload. If you need built-in computer-use capability specifically, 3.6 Flash is one of the few current options that ships it natively rather than requiring a separate tool-use scaffold on top. For the hardest reasoning-heavy tasks, it's worth checking whether 3.5 Pro has shipped since this was written before assuming Google's flagship tier is your best option today.`,
  },
];

async function seedArticles() {
  for (const a of articles) {
    await prisma.article.upsert({
      where: { slug: a.slug },
      update: { title: a.title, excerpt: a.excerpt, content: a.content, status: "PUBLISHED", publishedAt: new Date() },
      create: { title: a.title, slug: a.slug, excerpt: a.excerpt, content: a.content, status: "PUBLISHED", publishedAt: new Date(), aiGenerated: false },
    });
  }
  console.log(`Seeded ${articles.length} articles.`);
}

main()
  .then(seedArticles)
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
