import { useState } from "react";

import { useInventoryStore } from "../stores/useInventoryStore";
import { ConfirmButton } from "../components/ConfirmButton";
import { PageSearch } from "../components/PageSearch";
import { EntityEditor } from "../components/EntityEditor";
import { useListOrganization, ListOrderToolbar, ListOrderHandle } from "../components/ListOrganization";
import type { InventoryItem } from "../features/inventory/types";

export function InventoryPage() {
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const inventory = useInventoryStore(
    (state) => state.inventory,
  );

  const addItem = useInventoryStore(
    (state) => state.addItem,
  );

  const removeItem = useInventoryStore(
    (state) => state.removeItem,
  );

  const updateQuantity = useInventoryStore(
    (state) => state.updateQuantity,
  );

  const updateMinimumStock = useInventoryStore(
    (state) => state.updateMinimumStock,
  );
  const updateItem = useInventoryStore((state) => state.updateItem);

  const increaseQuantity = useInventoryStore(
    (state) => state.increaseQuantity,
  );

  const decreaseQuantity = useInventoryStore(
    (state) => state.decreaseQuantity,
  );

  const [editingQuantities, setEditingQuantities] =
  useState<Record<string, string>>({});

  const [product, setProduct] = useState("");
  const [brand, setBrand] = useState("");
  const [quantity, setQuantity] = useState("");
  const [minimumStock, setMinimumStock] = useState("");
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [minimumQuantity, setMinimumQuantity] = useState("");
  const [maximumQuantity, setMaximumQuantity] = useState("");
  const [editingMinimums, setEditingMinimums] =
    useState<Record<string, string>>({});

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const parsedQuantity = Number(quantity);
    const parsedMinimum = Number(minimumStock);

    if (!product.trim()) {
      return;
    }

    if (!brand.trim()) {
      return;
    }

    if (
      quantity === "" ||
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 0 ||
      minimumStock === "" ||
      !Number.isInteger(parsedMinimum) ||
      parsedMinimum < 0
    ) {
      return;
    }

    addItem({
      id: crypto.randomUUID(),
      product: product.trim(),
      brand: brand.trim(),
      quantity: parsedQuantity,
      minimumStock: parsedMinimum,
    });

    setProduct("");
    setBrand("");
    setQuantity("");
    setMinimumStock("");
  }

  const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
  const availableBrands = [...new Set(inventory.map((item) => item.brand))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const filteredInventory = inventory.filter((item) => {
    const matchesName = !normalizedSearch || item.product.toLocaleLowerCase("pt-BR").includes(normalizedSearch);
    const matchesBrand = !brandFilter || item.brand === brandFilter;
    const matchesMinimum = minimumQuantity === "" || item.quantity >= Number(minimumQuantity);
    const matchesMaximum = maximumQuantity === "" || item.quantity <= Number(maximumQuantity);
    return matchesName && matchesBrand && matchesMinimum && matchesMaximum;
  });

  const organized = useListOrganization("inventory:items", filteredInventory, (item) => item.product);
  return (
    <section>
      <header className="page-header">
        <div>
          <h2>Estoque</h2>

          <p>
            Controle de materiais elétricos.
          </p>
        </div>
        <PageSearch value={search} onChange={setSearch} placeholder="Buscar pelo nome do produto">
          <div className="page-search-filters inventory-search-filters">
            <label>Marca<select value={brandFilter} onChange={(event) => setBrandFilter(event.target.value)}><option value="">Todas as marcas</option>{availableBrands.map((value) => <option key={value}>{value}</option>)}</select></label>
            <label>Quantidade mínima<input type="number" min="0" value={minimumQuantity} onChange={(event) => setMinimumQuantity(event.target.value)} placeholder="0" /></label>
            <label>Quantidade máxima<input type="number" min="0" value={maximumQuantity} onChange={(event) => setMaximumQuantity(event.target.value)} placeholder="Sem limite" /></label>
            {(brandFilter || minimumQuantity || maximumQuantity) && <button type="button" onClick={() => { setBrandFilter(""); setMinimumQuantity(""); setMaximumQuantity(""); }}>Limpar filtros</button>}
          </div>
        </PageSearch>
      </header>

      <form
        className="inventory-form"
        onSubmit={handleSubmit}
      >
        <div className="form-group">
          <label htmlFor="inventory-product">
            Produto
          </label>

          <input
            id="inventory-product"
            type="text"
            value={product}
            onChange={(event) =>
              setProduct(event.target.value)
            }
            placeholder="Ex: Disjuntor 32A"
          />
        </div>

        <div className="form-group">
          <label htmlFor="inventory-brand">
            Marca
          </label>

          <input
            id="inventory-brand"
            type="text"
            value={brand}
            onChange={(event) =>
              setBrand(event.target.value)
            }
            placeholder="Ex: Schneider"
          />
        </div>

        <div className="form-group">
          <label htmlFor="inventory-quantity">
            Quantidade
          </label>

          <input
            id="inventory-quantity"
            type="number"
            min="0"
            step="1"
            required
            value={quantity}
            onChange={(event) =>
              setQuantity(event.target.value)
            }
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="inventory-minimum">Estoque mínimo</label>
          <input
            id="inventory-minimum"
            type="number"
            min="0"
            step="1"
            required
            value={minimumStock}
            onChange={(event) => setMinimumStock(event.target.value)}
            placeholder="0"
          />
        </div>

        <div className="inventory-form-actions">
          <button type="submit">
            + Adicionar produto
          </button>
        </div>
      </form>

      <ListOrderToolbar list={organized} label="estoque" />
      <div className="inventory-table-wrapper">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Marca</th>
              <th>Quantidade</th>
              <th>Mínimo</th>
              <th>Situação</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {organized.items.map((item) => (
              <tr key={item.id} {...organized.dropProps(item.id)}>
                <td>
                  <ListOrderHandle list={organized} id={item.id} label={item.product} />
                  {item.product}
                </td>

                <td>
                  {item.brand}
                </td>

                <td>
                  <div className="quantity-control">
                    <button
                      type="button"
                      onClick={() =>
                        decreaseQuantity(item.id)
                      }
                    >
                      −
                    </button>

                    <input
                      type="number"
                      min="0"
                      value={
                        editingQuantities[item.id] ??
                        String(item.quantity)
                      }
                      onChange={(event) => {
                        const rawValue = event.target.value;

                        setEditingQuantities((current) => ({
                          ...current,
                          [item.id]: rawValue,
                        }));
                      }}
                      onBlur={() => {
                        const rawValue =
                          editingQuantities[item.id];

                        if (
                          rawValue === undefined ||
                          rawValue === ""
                        ) {
                          setEditingQuantities((current) => {
                            const next = { ...current };
                            delete next[item.id];

                            return next;
                          });

                          return;
                        }

                        const newQuantity = Number(rawValue);

                        if (
                          !Number.isNaN(newQuantity) &&
                          newQuantity >= 0
                        ) {
                          updateQuantity(
                            item.id,
                            newQuantity,
                          );
                        }

                        setEditingQuantities((current) => {
                          const next = { ...current };
                          delete next[item.id];

                          return next;
                        });
                      }}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        increaseQuantity(item.id)
                      }
                    >
                      +
                    </button>
                  </div>
                </td>

                <td>
                  <input
                    className="inventory-minimum-input"
                    type="number"
                    min="0"
                    step="1"
                    aria-label={`Estoque mínimo de ${item.product}`}
                    value={editingMinimums[item.id] ?? (item.minimumStock === undefined ? "" : String(item.minimumStock))}
                    placeholder="Definir"
                    onChange={(event) => setEditingMinimums((current) => ({
                      ...current,
                      [item.id]: event.target.value,
                    }))}
                    onBlur={() => {
                      const raw = editingMinimums[item.id];
                      if (raw !== undefined && raw !== "") {
                        updateMinimumStock(item.id, Number(raw));
                      }
                      setEditingMinimums((current) => {
                        const next = { ...current };
                        delete next[item.id];
                        return next;
                      });
                    }}
                  />
                </td>

                <td>
                  {item.minimumStock === undefined ? (
                    <span className="stock-status">Não definido</span>
                  ) : item.quantity < item.minimumStock ? (
                    <span className="stock-status stock-status-low">Abaixo do mínimo</span>
                  ) : item.quantity === item.minimumStock ? (
                    <span className="stock-status stock-status-limit">No mínimo</span>
                  ) : (
                    <span className="stock-status stock-status-normal">Normal</span>
                  )}
                </td>

                <td>
                  <ConfirmButton className="inventory-delete" ariaLabel={`Excluir ${item.product} do estoque`} onConfirm={() => removeItem(item.id)} />
                  <button type="button" className="inventory-delete" onClick={() => setEditing(item)}>Editar</button>
                </td>
              </tr>
            ))}

            {filteredInventory.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="inventory-empty"
                >
                  {inventory.length === 0 ? "Nenhum produto cadastrado." : "Nenhum produto encontrado com estes filtros."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {editing && <EntityEditor key={editing.id} title="Editar produto" initial={{ ...editing }} fields={[{ name: "product", label: "Produto", required: true }, { name: "brand", label: "Marca", required: true }, { name: "quantity", label: "Quantidade", type: "number", min: 0, step: "1", required: true }, { name: "minimumStock", label: "Estoque mínimo", type: "number", min: 0, step: "1" }, { name: "idealStock", label: "Estoque ideal", type: "number", min: 0, step: "1" }, { name: "unit", label: "Unidade" }, { name: "location", label: "Localização" }, { name: "supplier", label: "Fornecedor" }]} onSave={(values) => { updateItem(editing.id, { product: values.product, brand: values.brand, quantity: Number(values.quantity), minimumStock: values.minimumStock === "" ? undefined : Number(values.minimumStock), idealStock: values.idealStock === "" ? undefined : Number(values.idealStock), unit: values.unit || undefined, location: values.location || undefined, supplier: values.supplier || undefined }); setEditingQuantities((current) => { const next = { ...current }; delete next[editing.id]; return next; }); setEditingMinimums((current) => { const next = { ...current }; delete next[editing.id]; return next; }); }} onClose={() => setEditing(null)} />}
    </section>
  );
}
