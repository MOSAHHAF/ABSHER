import { useState, useEffect } from 'react';
import { supabase, DebitCard, CardTransaction } from '../lib/supabase';
import { CreditCard, TrendingDown, ShoppingBag, Utensils, Film, GraduationCap, Activity, MapPin } from 'lucide-react';

interface DebitCardExpensesProps {
  dependentId: string;
  dependentName: string;
}

interface CardWithTransactions extends DebitCard {
  transactions: CardTransaction[];
}

export default function DebitCardExpenses({ dependentId, dependentName }: DebitCardExpensesProps) {
  const [cards, setCards] = useState<CardWithTransactions[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<CardWithTransactions | null>(null);

  useEffect(() => {
    loadCards();
  }, [dependentId]);

  async function loadCards() {
    setLoading(true);

    const { data: cardsData } = await supabase
      .from('debit_cards')
      .select('*')
      .eq('profile_id', dependentId)
      .eq('is_active', true);

    if (cardsData && cardsData.length > 0) {
      const cardsWithTransactions = await Promise.all(
        cardsData.map(async (card) => {
          const { data: transactions } = await supabase
            .from('card_transactions')
            .select('*')
            .eq('card_id', card.id)
            .order('transaction_date', { ascending: false })
            .limit(50);

          return {
            ...card,
            transactions: transactions || []
          };
        })
      );

      setCards(cardsWithTransactions);
      if (cardsWithTransactions.length > 0) {
        setSelectedCard(cardsWithTransactions[0]);
      }
    }

    setLoading(false);
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food':
        return <Utensils className="w-4 h-4" />;
      case 'shopping':
        return <ShoppingBag className="w-4 h-4" />;
      case 'entertainment':
        return <Film className="w-4 h-4" />;
      case 'education':
        return <GraduationCap className="w-4 h-4" />;
      case 'health':
        return <Activity className="w-4 h-4" />;
      default:
        return <TrendingDown className="w-4 h-4" />;
    }
  };

  const getCategoryNameAr = (category: string) => {
    const names: Record<string, string> = {
      food: 'طعام',
      shopping: 'تسوق',
      entertainment: 'ترفيه',
      education: 'تعليم',
      health: 'صحة',
      transportation: 'مواصلات'
    };
    return names[category] || category;
  };

  const getSpendingByCategory = (transactions: CardTransaction[]) => {
    const categoryTotals: Record<string, number> = {};
    transactions.forEach(t => {
      if (!categoryTotals[t.category]) {
        categoryTotals[t.category] = 0;
      }
      categoryTotals[t.category] += Number(t.amount);
    });
    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  };

  const getMonthlySpending = (transactions: CardTransaction[]) => {
    const now = new Date();
    const thisMonth = transactions.filter(t => {
      const tDate = new Date(t.transaction_date);
      return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
    });
    return thisMonth.reduce((sum, t) => sum + Number(t.amount), 0);
  };

  const getDailyAverage = (transactions: CardTransaction[]) => {
    if (transactions.length === 0) return 0;
    const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    return total / 30;
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">جاري التحميل...</div>;
  }

  if (cards.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-8 text-center">
        <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">لا توجد بطاقات صراف مرتبطة</p>
      </div>
    );
  }

  const card = selectedCard || cards[0];
  const monthlySpending = getMonthlySpending(card.transactions);
  const dailyAverage = getDailyAverage(card.transactions);
  const categorySpending = getSpendingByCategory(card.transactions);

  return (
    <div className="space-y-6">
      {cards.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {cards.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCard(c)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                selectedCard?.id === c.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {c.bank_name}
            </button>
          ))}
        </div>
      )}

      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-blue-100 text-sm mb-1">بطاقة الصراف</p>
            <p className="text-2xl font-bold">{card.bank_name}</p>
          </div>
          <CreditCard className="w-12 h-12 text-blue-200" />
        </div>

        <div className="mb-6">
          <p className="text-blue-100 text-xs mb-2">رقم البطاقة</p>
          <p className="text-xl font-mono tracking-wider">{card.card_number}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-blue-100 text-xs mb-1">حامل البطاقة</p>
            <p className="font-medium">{card.card_holder_name}</p>
          </div>
          <div>
            <p className="text-blue-100 text-xs mb-1">الحد الشهري</p>
            <p className="font-bold text-lg">{card.monthly_limit.toLocaleString()} ريال</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">إجمالي المصروفات</p>
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{monthlySpending.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">ريال هذا الشهر</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">المتوسط اليومي</p>
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{dailyAverage.toFixed(0)}</p>
          <p className="text-xs text-gray-500 mt-1">ريال في اليوم</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">المتبقي</p>
            <CreditCard className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {(card.monthly_limit - monthlySpending).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">من {card.monthly_limit.toLocaleString()} ريال</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">المصروفات حسب الفئة</h3>
        <div className="space-y-3">
          {categorySpending.map(({ category, amount }) => {
            const percentage = (amount / monthlySpending) * 100;
            return (
              <div key={category}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getCategoryIcon(category)}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {getCategoryNameAr(category)}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-900">{amount.toLocaleString()} ريال</p>
                    <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          آخر العمليات ({card.transactions.length})
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {card.transactions.slice(0, 20).map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  {getCategoryIcon(transaction.category)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{transaction.merchant_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.transaction_date).toLocaleDateString('ar-SA')}
                    </p>
                    {transaction.location && (
                      <>
                        <span className="text-gray-300">•</span>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {transaction.location}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-red-600">
                  -{Number(transaction.amount).toLocaleString()} ريال
                </p>
                <p className="text-xs text-gray-500">{getCategoryNameAr(transaction.category)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
