async function gerarAudio() {
  const texto = document.getElementById('texto').value.trim();
  if (!texto) {
    alert('Digite algum texto!');
    return;
  }

  const player = document.getElementById('player');
  player.src = ''; // limpa áudio anterior

  try {
    const resposta = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text: texto, 
        voice: 'bVMeCyTHy58xNoL34h3p' // voice_id Jeremy
      })
    });

    if (!resposta.ok) {
      const err = await resposta.json();
      console.error('Erro API TTS:', err);
      alert('Erro ao gerar áudio: ' + (err.details?.detail || err.error));
      return;
    }

    const blob = await resposta.blob();
    const url = URL.createObjectURL(blob);
    player.src = url;
    player.play();

  } catch (e) {
    console.error('Erro frontend:', e);
    alert('Erro ao conectar com a API TTS.');
  }
}
