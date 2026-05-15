const { useState, useMemo, useEffect } = React;

const App = () => {
    const [catchment, setCatchment] = useState(LUCA_DATA.catchments[8]); // Default to Waihī Estuary
    const [deltas, setDeltas] = useState({}); // { landUseName: deltaValue }
    const [customLandUses, setCustomLandUses] = useState(
        LUCA_DATA.customLandUses.reduce((acc, name) => ({
            ...acc,
            [name]: { name: name, baseline: 0 }
        }), {})
    );
    const [activeTab, setActiveTab] = useState('scenario');
    const [collapsedDomains, setCollapsedDomains] = useState({
        Economic: false,
        Environmental: false,
        Social: false
    });

    // Calculate Scenario Areas
    const scenarioData = useMemo(() => {
        const baseline = LUCA_DATA.baseline[catchment];
        const data = {};
        
        LUCA_DATA.allLandUses.forEach(lu => {
            const isCustom = LUCA_DATA.customLandUses.includes(lu);
            const baseArea = isCustom ? customLandUses[lu].baseline : baseline[lu];
            const delta = deltas[lu] || 0;
            const scenarioArea = Math.max(0, baseArea + delta);
            data[lu] = {
                baseline: baseArea,
                delta: delta,
                scenario: scenarioArea,
                percentage: baseArea > 0 ? (scenarioArea / baseArea) * 100 : 0
            };
        });
        return data;
    }, [catchment, deltas, customLandUses]);

    // Calculate Impacts
    const impactResults = useMemo(() => {
        const results = [];
        
        LUCA_DATA.indicators.forEach(indicator => {
            let totalBaseline = 0;
            let totalScenario = 0;
            
            LUCA_DATA.allLandUses.forEach(lu => {
                const multiplier = LUCA_DATA.assumptions[catchment][indicator.name][lu] || 0;
                totalBaseline += scenarioData[lu].baseline * multiplier;
                totalScenario += scenarioData[lu].scenario * multiplier;
            });
            
            const netImpact = totalScenario - totalBaseline;
            const percentageChange = totalBaseline !== 0 ? (netImpact / Math.abs(totalBaseline)) * 100 : 0;
            
            // Classification logic
            let isBenefit = false;
            if (indicator.domain === 'Economic' || indicator.domain === 'Social' || indicator.type === 'scoring') {
                isBenefit = netImpact >= 0;
            } else {
                // Environmental physical metrics (N loss, P loss, GHG)
                isBenefit = netImpact <= 0;
            }

            results.push({
                ...indicator,
                baseline: totalBaseline,
                scenario: totalScenario,
                net: netImpact,
                percent: percentageChange,
                isBenefit: isBenefit
            });
        });
        
        return results;
    }, [catchment, scenarioData]);

    const formatNumber = (num, decimals = 0) => {
        return new Intl.NumberFormat('en-NZ', {
            maximumFractionDigits: decimals,
            minimumFractionDigits: decimals
        }).format(num);
    };

    const handleDeltaChange = (lu, val) => {
        setDeltas(prev => ({ ...prev, [lu]: parseFloat(val) || 0 }));
    };

    const resetDeltas = () => {
        setDeltas({});
    };

    const toggleDomain = (domain) => {
        setCollapsedDomains(prev => ({...prev, [domain]: !prev[domain]}));
    };

    return (
        <div className="app-container">
            <header>
                <div>
                    <h1>LUCA</h1>
                    <p style={{color: 'var(--text-secondary)'}}>Land Use Change Assessor</p>
                </div>
                <div className="glass-panel selector-container">
                    <label>Catchment / FMU:</label>
                    <select value={catchment} onChange={(e) => setCatchment(e.target.value)}>
                        {LUCA_DATA.catchments.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </header>

            <nav className="tabs-container">
                <button 
                    className={`tab-btn ${activeTab === 'scenario' ? 'active' : ''}`}
                    onClick={() => setActiveTab('scenario')}
                >
                    Land Use Scenario
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'results' ? 'active' : ''}`}
                    onClick={() => setActiveTab('results')}
                >
                    Results Dashboard
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'glossary' ? 'active' : ''}`}
                    onClick={() => setActiveTab('glossary')}
                >
                    Glossary
                </button>
            </nav>

            <main className="glass-panel" style={{padding: '2rem'}}>
                {activeTab === 'scenario' && (
                    <section className="fade-in">
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
                            <h2>Define Changes (ha)</h2>
                            <button className="tab-btn" onClick={resetDeltas} style={{border: '1px solid var(--border-color)'}}>
                                Reset All Changes
                            </button>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Land Use</th>
                                    <th style={{textAlign: 'right'}}>Baseline (ha)</th>
                                    <th style={{textAlign: 'right'}}>Change Δ (ha)</th>
                                    <th style={{textAlign: 'right'}}>Scenario (ha)</th>
                                    <th style={{textAlign: 'right'}}>% of Baseline</th>
                                </tr>
                            </thead>
                            <tbody>
                                {LUCA_DATA.allLandUses.map(lu => (
                                    <tr key={lu}>
                                        <td>{lu}</td>
                                        <td style={{textAlign: 'right'}}>{formatNumber(scenarioData[lu].baseline)}</td>
                                        <td style={{textAlign: 'right'}}>
                                            <input 
                                                type="number" 
                                                className="number-input"
                                                value={deltas[lu] || ''}
                                                placeholder="0"
                                                onChange={(e) => handleDeltaChange(lu, e.target.value)}
                                            />
                                        </td>
                                        <td style={{textAlign: 'right', fontWeight: '600', color: scenarioData[lu].scenario !== scenarioData[lu].baseline ? 'var(--accent-green)' : 'inherit'}}>
                                            {formatNumber(scenarioData[lu].scenario)}
                                        </td>
                                        <td style={{textAlign: 'right', color: 'var(--text-secondary)'}}>
                                            {formatNumber(scenarioData[lu].percentage, 1)}%
                                        </td>
                                    </tr>
                                ))}
                                <tr style={{fontWeight: '700'}}>
                                    <td>TOTAL</td>
                                    <td style={{textAlign: 'right'}}>{formatNumber(Object.values(scenarioData).reduce((s, d) => s + d.baseline, 0))}</td>
                                    <td style={{textAlign: 'right'}}>{formatNumber(Object.values(scenarioData).reduce((s, d) => s + d.delta, 0))}</td>
                                    <td style={{textAlign: 'right'}}>{formatNumber(Object.values(scenarioData).reduce((s, d) => s + d.scenario, 0))}</td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                    </section>
                )}

                {activeTab === 'results' && (
                    <section className="fade-in">
                        <div className="results-grid">
                            {['Economic', 'Environmental', 'Social'].map(domain => {
                                const dResults = impactResults.filter(r => r.domain === domain && r.net !== 0);
                                return (
                                    <div key={domain} className="glass-panel result-card">
                                        <h3>{domain} Change</h3>
                                        <div className="bar-chart-container">
                                            {dResults.map(r => (
                                                <div key={r.name} className="bar-row">
                                                    <div className="bar-label">
                                                        <span>{r.name}</span>
                                                        <span className={`badge ${r.isBenefit ? 'benefit' : 'negative'}`}>
                                                            {r.percent > 0 ? '+' : ''}{formatNumber(r.percent, 1)}%
                                                        </span>
                                                    </div>
                                                    <div className="bar-track">
                                                        <div 
                                                            className={`bar-fill ${r.isBenefit ? 'benefit-bg' : 'negative-bg'}`} 
                                                            style={{ width: `${Math.min(Math.abs(r.percent), 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ))}
                                            {dResults.length === 0 && <p style={{color: 'var(--text-secondary)'}}>No changes in this domain.</p>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{marginTop: '3rem'}}>
                            <h2>Detailed Impacts Breakdown</h2>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Indicator</th>
                                        <th style={{textAlign: 'right'}}>Baseline Total</th>
                                        <th style={{textAlign: 'right'}}>Scenario Total</th>
                                        <th style={{textAlign: 'right'}}>Net Change</th>
                                        <th style={{textAlign: 'right'}}>% Change</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {['Economic', 'Environmental', 'Social'].map(domain => {
                                        const dResults = impactResults.filter(r => r.domain === domain);
                                        if (dResults.length === 0) return null;
                                        const isCollapsed = collapsedDomains[domain];
                                        
                                        let maxChange = 0;
                                        let maxIsBenefit = true;
                                        dResults.forEach(r => {
                                            if (Math.abs(r.percent) > Math.abs(maxChange)) {
                                                maxChange = r.percent;
                                                maxIsBenefit = r.isBenefit;
                                            }
                                        });

                                        return (
                                            <React.Fragment key={domain}>
                                                <tr className="domain-header" onClick={() => toggleDomain(domain)} style={{cursor: 'pointer', background: 'rgba(255,255,255,0.05)'}}>
                                                    <td colSpan="5" style={{fontWeight: 'bold', paddingTop: '1rem', paddingBottom: '1rem'}}>
                                                        <span style={{display: 'inline-block', width: '20px'}}>{isCollapsed ? '▶' : '▼'}</span>
                                                        {domain} Impacts
                                                        {isCollapsed && maxChange !== 0 && (
                                                            <span style={{marginLeft: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)'}}>
                                                                Max Change: <span className={`badge ${maxIsBenefit ? 'benefit' : 'negative'}`}>
                                                                    {maxChange > 0 ? '+' : ''}{formatNumber(maxChange, 2)}%
                                                                </span>
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                                {!isCollapsed && dResults.map(r => (
                                                    <tr key={r.name}>
                                                        <td style={{paddingLeft: '2.5rem'}}>{r.name} <small style={{color: 'var(--text-secondary)'}}>({r.unit})</small></td>
                                                        <td style={{textAlign: 'right'}}>{formatNumber(r.baseline, r.type === 'metric' ? 0 : 1)}</td>
                                                        <td style={{textAlign: 'right', fontWeight: '600'}}>{formatNumber(r.scenario, r.type === 'metric' ? 0 : 1)}</td>
                                                        <td style={{textAlign: 'right', color: r.isBenefit ? 'var(--accent-green)' : '#ef4444'}}>
                                                            {r.net > 0 ? '+' : ''}{formatNumber(r.net, 1)}
                                                        </td>
                                                        <td style={{textAlign: 'right'}}>
                                                            <span className={`badge ${r.isBenefit ? 'benefit' : 'negative'}`}>
                                                                {r.percent > 0 ? '+' : ''}{formatNumber(r.percent, 2)}%
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {activeTab === 'glossary' && (
                    <section className="fade-in">
                        <h2>Indicator Glossary</h2>
                        <div style={{display: 'grid', gap: '1.5rem', marginTop: '2rem'}}>
                            {LUCA_DATA.indicators.map(ind => (
                                <div key={ind.name} className="glass-panel" style={{padding: '1.5rem', background: 'rgba(255,255,255,0.02)'}}>
                                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                                        <h4 style={{color: var(--accent-green)}}>{ind.name}</h4>
                                        <span style={{fontSize: '0.75rem', color: 'var(--text-secondary)'}}>{ind.domain} | {ind.unit}</span>
                                    </div>
                                    <p style={{fontSize: '0.875rem', color: 'var(--text-primary)'}}>{ind.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
