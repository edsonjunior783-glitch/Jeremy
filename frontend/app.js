async function gerarAudio() {
  const texto = document.getElementById('texto').value;
  const resposta = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: texto, voice: 'Jeremy' })
  });
  const blob = await resposta.blob();
  const url = URL.createObjectURL(blob);
  const audio = document.getElementById('player');
  audio.src = url;
  audio.play();
}
