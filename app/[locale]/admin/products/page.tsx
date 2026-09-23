'use client';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  getProducts, addProduct, updateProduct, deleteProduct, Product
} from '@/lib/firestore';
import { formatPrice } from '@/lib/utils';
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY: Omit<Product, 'id'> = {
  nameAr: '', nameEn: '', descAr: '', descEn: '',
  price: 0, image: '', category: 'Scrubs', stock: 0
};

export default function AdminProductsPage() {
  const locale = useLocale();
  const t = useTranslations();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);

  const load = () => {
    setLoading(true);
    getProducts().then(setProducts).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openNew = () => {
    setEditing({ ...EMPTY, id: undefined } as any);
    setIsNew(true);
  };

  const openEdit = (p: Product) => {
    setEditing({ ...p });
    setIsNew(false);
  };

  const close = () => { setEditing(null); setIsNew(false); };

  const save = async () => {
    if (!editing) return;
    if (!editing.nameAr || !editing.nameEn || editing.price <= 0) {
      toast.error(locale === 'ar' ? 'أكمل البيانات' : 'Fill all fields');
      return;
    }
    try {
      if (isNew) {
        const { id, ...data } = editing as any;
        await addProduct(data);
        toast.success(locale === 'ar' ? 'تمت الإضافة' : 'Added');
      } else {
        const { id, ...data } = editing as any;
        await updateProduct(id, data);
        toast.success(locale === 'ar' ? 'تم التحديث' : 'Updated');
      }
      close();
      load();
    } catch (e) {
      toast.error(t('auth.error'));
    }
  };

  const remove = async (id: string) => {
    if (!confirm(locale === 'ar' ? 'تأكيد الحذف؟' : 'Confirm delete?')) return;
    await deleteProduct(id);
    toast.success(locale === 'ar' ? 'تم الحذف' : 'Deleted');
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-navy-700">{t('admin.products')}</h2>
        <button onClick={openNew} className="btn-primary py-2 px-4">
          <Plus size={18} />
          {t('admin.addProduct')}
        </button>
      </div>

      {loading ? (
        <div className="card p-8 text-center text-gray-500">{t('common.loading')}</div>
      ) : products.length === 0 ? (
        <div className="card p-8 text-center text-gray-500">
          لا توجد منتجات — أضف أول منتج
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-right">المنتج</th>
                <th className="p-3 text-right">التصنيف</th>
                <th className="p-3 text-right">السعر</th>
                <th className="p-3 text-right">الكمية</th>
                <th className="p-3 text-right">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image} className="w-10 h-10 rounded object-cover" />
                      <div>
                        <p className="font-semibold">{p.nameAr}</p>
                        <p className="text-xs text-gray-500">{p.nameEn}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">{p.category}</td>
                  <td className="p-3 font-bold text-teal-600">{formatPrice(p.price, locale)}</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)}
                        className="p-2 hover:bg-blue-100 rounded text-blue-600">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => remove(p.id!)}
                        className="p-2 hover:bg-red-100 rounded text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
              <h3 className="font-bold text-navy-700 text-lg">
                {isNew ? t('admin.addProduct') : t('admin.editProduct')}
              </h3>
              <button onClick={close}><X size={22} /></button>
            </div>

            <div className="p-4 grid md:grid-cols-2 gap-4">
              <div><label className="label">{t('admin.fields.nameAr')}</label>
                <input value={editing.nameAr}
                  onChange={e => setEditing({ ...editing, nameAr: e.target.value })}
                  className="input" /></div>
              <div><label className="label">{t('admin.fields.nameEn')}</label>
                <input value={editing.nameEn} dir="ltr"
                  onChange={e => setEditing({ ...editing, nameEn: e.target.value })}
                  className="input" /></div>

              <div className="md:col-span-2"><label className="label">{t('admin.fields.descAr')}</label>
                <textarea value={editing.descAr} rows={2}
                  onChange={e => setEditing({ ...editing, descAr: e.target.value })}
                  className="input resize-none" /></div>

              <div className="md:col-span-2"><label className="label">{t('admin.fields.descEn')}</label>
                <textarea value={editing.descEn} rows={2} dir="ltr"
                  onChange={e => setEditing({ ...editing, descEn: e.target.value })}
                  className="input resize-none" /></div>

              <div><label className="label">{t('admin.fields.price')}</label>
                <input type="number" value={editing.price}
                  onChange={e => setEditing({ ...editing, price: +e.target.value })}
                  className="input" /></div>

              <div><label className="label">{t('admin.fields.oldPrice')}</label>
                <input type="number" value={editing.oldPrice || ''}
                  onChange={e => setEditing({ ...editing, oldPrice: +e.target.value || undefined })}
                  className="input" /></div>

              <div><label className="label">{t('admin.fields.category')}</label>
                <input value={editing.category}
                  onChange={e => setEditing({ ...editing, category: e.target.value })}
                  className="input" /></div>

              <div><label className="label">{t('admin.fields.stock')}</label>
                <input type="number" value={editing.stock}
                  onChange={e => setEditing({ ...editing, stock: +e.target.value })}
                  className="input" /></div>

              <div className="md:col-span-2"><label className="label">{t('admin.fields.image')}</label>
                <input value={editing.image} dir="ltr"
                  onChange={e => setEditing({ ...editing, image: e.target.value })}
                  className="input" placeholder="https://..." /></div>

              {editing.image && (
                <div className="md:col-span-2">
                  <img src={editing.image} className="w-32 h-32 object-cover rounded-lg" />
                </div>
              )}
            </div>

            <div className="flex gap-3 p-4 border-t">
              <button onClick={save} className="btn-primary flex-1">
                <Save size={18} />
                {t('admin.save')}
              </button>
              <button onClick={close} className="btn-outline flex-1">
                {t('admin.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}