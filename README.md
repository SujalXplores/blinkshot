<div align="center">
  <a href="https://www.blinkshot.io">
    <img alt="Blinkshot" src="./public/og-image.png">
    <h1>BlinkShot</h1>
  </a>

  <p>
    An open-source real-time AI image generator powered by Flux through Together.ai
  </p>

  <p>
    <a href="https://github.com/SujalXplores/blinkshot/blob/main/LICENSE">
      <img src="https://img.shields.io/github/license/SujalXplores/blinkshot?style=flat-square" alt="License" />
    </a>
    <a href="https://github.com/SujalXplores/blinkshot/stargazers">
      <img src="https://img.shields.io/github/stars/SujalXplores/blinkshot?style=flat-square" alt="Stars" />
    </a>
    <a href="https://twitter.com/sujal_shah10">
      <img src="https://img.shields.io/twitter/follow/sujal_shah10?style=flat-square&logo=twitter" alt="Follow on Twitter" />
    </a>
  </p>
</div>

## ✨ Features

- 🚀 Real-time image generation as you type
- 🎨 Consistency mode for iterative generations
- 🖼️ Featured gallery of generations
- 📥 Easy image downloads
- 🔑 Optional BYOK (Bring Your Own Key) support
- 🌐 Rate limiting and analytics built-in

## 🛠️ Tech Stack

- [**Flux Schnell**](https://www.dub.sh/together-flux/) - High-performance image model from BFL
- [**Together AI**](https://www.dub.sh/together-ai) - Inference API provider
- [**Next.js 14**](https://nextjs.org/) - React framework with App Router
- [**Tailwind CSS**](https://tailwindcss.com) - Utility-first CSS framework
- [**Helicone**](https://helicone.ai) - API observability
- [**Plausible**](https://plausible.io) - Privacy-friendly analytics

## 🚀 Getting Started

1. Clone the repository:

```bash
git clone https://github.com/SujalXplores/blinkshot
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file and add your Upstash & [Together AI API key](https://www.dub.sh/together-ai):

```bash
TOGETHER_API_KEY=your_api_key_here
UPSTASH_REDIS_REST_URL=your_redis_url_here
UPSTASH_REDIS_REST_TOKEN=your_redis_token_here
```

4. Start the development server:

```bash
npm run dev
```

## 🗺️ Roadmap

- [x] Build an image gallery of cool generations with their prompts
- [x] Add download functionality for generated images
- [ ] Implement authentication and email-based rate limiting
- [ ] Display remaining credits for users
- [ ] Add replay functionality for consistent generations
- [ ] Add configurable step settings (2-5)

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Open issues for bugs or feature requests
- Submit pull requests for improvements
- Share your feedback and suggestions

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Forked from [Nutlope/blinkshot](https://github.com/Nutlope/blinkshot)
- Built with [Together AI](https://www.together.ai) and [Flux](https://dub.sh/together-flux)
