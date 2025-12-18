import degit from "degit";

export async function downloadTemplate(repo: string, outDir: string, ref?: string) {
  const src = ref ? `${repo}#${ref}` : repo;
  const emitter = degit(src, {
    cache: false,
    force: true,
    verbose: false,
  });

  await emitter.clone(outDir);
}
