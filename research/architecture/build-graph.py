"""Rebuild the local code graph with Graphify; no model/API calls."""
import json
from collections import Counter
from pathlib import Path
from graphify.detect import detect, save_manifest
from graphify.extract import extract
from graphify.build import build_from_json
from graphify.cluster import cluster, score_all
from graphify.analyze import god_nodes, surprising_connections, suggest_questions
from graphify.report import generate
from graphify.export import to_json
from graphify.diagnostics import diagnose_extraction

def main():
    root=Path(__file__).resolve().parents[2]
    out=root/'graphify-out';out.mkdir(exist_ok=True)
    detection=detect(root)
    extraction=extract([Path(f) for f in detection['files']['code']],cache_root=root,parallel=False)
    graph=build_from_json(extraction,root=str(root),directed=True)
    if not graph.number_of_nodes(): raise RuntimeError('Empty extraction')
    communities=cluster(graph);cohesion=score_all(graph,communities)
    # Label by dominant source instead of persisting unstable community IDs.
    labels = {}
    for community, members in communities.items():
        sources = Counter(graph.nodes[node].get('source_file', 'unknown') for node in members)
        labels[community] = ' / '.join(path for path, _ in sources.most_common(2))
    gods=god_nodes(graph);surprises=surprising_connections(graph,communities);questions=suggest_questions(graph,communities,labels)
    if not to_json(graph,communities,str(out/'graph.json'),community_labels=labels): raise RuntimeError('Graphify refused graph shrink')
    report=generate(graph,communities,cohesion,labels,gods,surprises,detection,{'input':0,'output':0},str(root),suggested_questions=questions)
    (out/'GRAPH_REPORT.md').write_text(report)
    (out/'analysis.json').write_text(json.dumps({'communities':communities,'cohesion':cohesion,'gods':gods,'surprises':surprises,'questions':questions},indent=2))
    (out/'health.json').write_text(json.dumps(diagnose_extraction(extraction,directed=True,root=str(root)),indent=2))
    save_manifest(detection['files'],root=str(root),scan_corpus={f for fs in detection['files'].values() for f in fs})
    print(f'{len(detection["files"]["code"])} files; {graph.number_of_nodes()} nodes; {graph.number_of_edges()} edges; {len(communities)} communities')

if __name__=='__main__': main()
