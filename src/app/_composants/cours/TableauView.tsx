interface TableauViewProps {
  entetes: readonly string[];
  lignes: readonly (readonly string[])[];
}

export function TableauView({ entetes, lignes }: TableauViewProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {entetes.map((entete, i) => (
              <th
                key={i}
                className="border-b border-bordure bg-fond px-4 py-2 text-left font-medium"
              >
                {entete}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lignes.map((ligne, i) => (
            <tr key={i} className="border-b border-bordure last:border-0">
              {ligne.map((cellule, j) => (
                <td key={j} className="px-4 py-2">
                  {cellule}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
