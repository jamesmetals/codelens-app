import { Component } from "react";

export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      hasError: false,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      error,
      hasError: true,
    };
  }

  componentDidCatch(error, info) {
    console.error("[AppErrorBoundary] runtime error", error, info);
  }

  handleReset = () => {
    this.setState({
      error: null,
      hasError: false,
    });
  };

  render() {
    if (this.state.hasError) {
      const errorMessage = String(
        this.state.error?.message || "Ocorreu um erro inesperado na interface.",
      ).trim();

      return (
        <main className="flex min-h-screen items-center justify-center bg-[#060e20] px-4 py-10 text-[#dee5ff]">
          <section className="w-full max-w-xl rounded-3xl border border-rose-400/20 bg-[#0f1930] p-6 shadow-2xl shadow-black/40">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-300/80">
              Falha de interface
            </p>
            <h1 className="mt-3 text-2xl font-bold text-white">
              A tela nao foi renderizada com seguranca.
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              O erro foi interceptado antes de deixar o aplicativo inteiro em branco. Tente
              recarregar a tela ou retomar o fluxo abaixo.
            </p>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Detalhe tecnico
              </p>
              <pre className="mt-3 whitespace-pre-wrap break-words font-mono text-xs leading-6 text-rose-100">
                {errorMessage}
              </pre>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="rounded-xl border border-sky-400/25 bg-sky-500/10 px-4 py-2.5 text-sm font-semibold text-sky-100 transition-colors hover:bg-sky-500/20"
              >
                Tentar renderizar novamente
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Recarregar aplicacao
              </button>
            </div>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
