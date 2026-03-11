import { Asset } from "@/types/schema";

interface AssetListProps {
  assets: Asset[];
}

export default function AssetList({ assets }: AssetListProps) {
  return (
    <div className="space-y-6">
      {assets.map((asset) => (
        <div key={asset.id} className="border border-black p-6 space-y-4">
          <h2 className="text-xl font-bold uppercase">{asset.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-l-4 border-black pl-4">
              <p className="text-xs font-bold text-gray-500 uppercase">Offering</p>
              <p className="text-sm">{asset.offering}</p>
            </div>
            <div className="border-l-4 border-gray-400 pl-4">
              <p className="text-xs font-bold text-gray-500 uppercase">Seeking</p>
              <p className="text-sm">{asset.seeking}</p>
            </div>
          </div>
          <div className="text-xs font-mono">STATUS: {asset.asset_status.toUpperCase()}</div>
        </div>
      ))}
    </div>
  );
}
