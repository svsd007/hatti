// Lightweight, local vector illustrations: no remote image requests or layout shifts.
export default function ProduceArt({ kind }: { kind: string }) {
  return <svg className="produce-art" viewBox="0 0 200 180" aria-hidden="true" focusable="false">
    <ellipse cx="103" cy="159" rx="55" ry="8" fill="#283d2d" opacity=".09" />
    {kind === "strawberry" ? <g transform="rotate(-12 100 90)">
      <path d="M49 69C50 40 147 36 153 70c8 40-38 89-51 90S42 109 49 69" fill="#c85045" />
      <path d="M57 68c14-18 37-14 43-9-19 16-28 48-21 68-18-22-28-44-22-59" fill="#e27762" />
      <path d="m99 59-33-14 12 22-30 1 28 13 24-12 25 14-7-20 31-7-33-5 6-22-19 20-9-17Z" fill="#3d6744" />
      <path d="m104 51 2-21" stroke="#315539" strokeWidth="5" strokeLinecap="round" />
      {[ [65,87],[91,82],[126,88],[76,108],[107,105],[122,119],[95,128],[102,144]].map(([x,y])=><ellipse key={`${x}-${y}`} cx={x} cy={y} rx="2" ry="3.5" fill="#f5d393" transform={`rotate(12 ${x} ${y})`} />)}
    </g> : kind === "tomato" ? <g>
      <path d="M101 59c-34-24-65 2-61 42 3 36 23 53 58 54 38 1 68-23 64-59-4-36-33-48-61-37" fill="#cb523b" />
      <ellipse cx="73" cy="91" rx="19" ry="28" fill="#e57955" transform="rotate(20 73 91)" />
      <path d="m103 69-33-13 25-1-3-26 14 21 28-9-20 18 25 16-29-4-15 16Z" fill="#416c40" />
      <path d="m104 61 6-29" stroke="#375835" strokeWidth="5" strokeLinecap="round" />
    </g> : kind === "corn" ? <g transform="rotate(24 100 90)">
      <path d="M75 143V62c0-53 53-53 53 0v81Z" fill="#e8b749" />
      {Array.from({length:8},(_,row)=>Array.from({length:4},(_,col)=><rect key={`${row}-${col}`} x={79+col*12} y={41+row*12} width="9" height="9" rx="4" fill={(row+col)%2 ? "#f7d874" : "#efc65c"} />))}
      <path d="M99 159C60 137 58 87 46 67c35 14 44 55 53 92" fill="#73965b" />
      <path d="M97 159c-2-51 30-81 53-89-17 27-1 67-53 89" fill="#466c43" />
      <path d="M99 159c9-30 19-48 34-64" fill="none" stroke="#a0b371" strokeWidth="2" />
    </g> : kind === "blueberry" ? <g>
      <path d="M102 71c-1-39 27-48 47-44-4 25-21 39-47 44" fill="#607952" />
      {[[75,80,29],[120,83,32],[59,117,27],[132,123,29],[96,131,32]].map(([x,y,r],i)=><g key={i}>
        <circle cx={x} cy={y} r={r} fill={i%2 ? "#506287" : "#64789c"} />
        <path d={`m${x-8} ${y-10} 6 2 4-6 3 7 6 1-6 5-7-1Z`} fill="#324862" />
        <path d={`M${x-r+8} ${y}q-2 13 7 17`} fill="none" stroke="#97a6bb" strokeWidth="3" strokeLinecap="round" />
      </g>)}
    </g> : kind === "carrot" ? <g transform="rotate(24 100 90)">
      <path d="M81 65c-4-21-30-31-25-45 20-2 37 15 39 41-1-22 6-42 18-44 8 13-3 34-14 47 14-17 26-23 38-16-2 15-27 20-38 21" fill="#55794a" />
      <path d="M73 73c-2-18 47-22 48-3 0 32-22 90-33 98-7-32-13-55-15-95" fill="#d88542" />
      <path d="M82 77c-1 20 2 49 8 66 10-25 17-51 15-68" fill="#e9a051" />
      <path d="m75 92 15 2m14 16 10-3m-32 21 11 1" stroke="#b96c36" strokeWidth="3" strokeLinecap="round" />
    </g> : kind === "peach" ? <g>
      <path d="M104 65C50 37 28 80 46 122c20 49 61 34 61 34s41 8 52-38c10-39-10-70-55-53" fill="#e3a56d" />
      <path d="M109 67c23 29 18 64-2 87" fill="none" stroke="#c87956" strokeWidth="3" />
      <path d="M103 64c3-28 27-38 55-35-6 25-29 36-55 35" fill="#5a7849" />
      <path d="m103 65-9-29" stroke="#775c3d" strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="70" cy="100" rx="15" ry="24" fill="#efbf88" />
    </g> : kind === "zucchini" ? <g transform="rotate(37 100 90)">
      <rect x="76" y="35" width="52" height="122" rx="26" fill="#4f7248" />
      <path d="M93 47v91m15-89v94" stroke="#88a469" strokeWidth="4" strokeLinecap="round" />
      <path d="m94 38-3-16 17-2 4 19" fill="#9b9c61" />
    </g> : <g>
      <path d="M103 150C48 146 25 119 44 99c-25-20-3-48 19-43-4-30 27-41 43-21 18-24 44-2 38 15 33-7 47 30 26 45 21 27-3 44-33 42Z" fill="#53774f" />
      <path d="M103 153c-32-29-30-53-21-65-22-17-7-31 11-33 14-13 31-5 28 13 21 1 27 22 9 36 15 19-4 41-27 49" fill="#789568" />
      <path d="M101 164 102 63m-1 69-34-22m35 10 32-34m-33 12L81 78" stroke="#c6cf97" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>}
  </svg>;
}
