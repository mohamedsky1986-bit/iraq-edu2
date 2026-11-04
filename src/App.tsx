<Users className="w-5 h-5 text-indigo-600" /> إدارة الطلبة ودرجاتهم وتعديل بياناتهم
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse min-w-[750px]">
                <thead>
                  <tr className="bg-slate-50 border-b text-slate-700 text-xs font-black">
                    <th className="p-3">الطالب والمرحلة</th>
                    <th className="p-3">تاريخ التسجيل & آخر ظهور</th>
                    <th className="p-3">بيانات الدخول (تعديل الاسم، اليوزر، الباسورد)</th>
                    <th className="p-3">الدرجة & VIP</th>
                    <th className="p-3 text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-xs font-bold text-slate-800">
                  {studentsList.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <div className="font-black text-slate-900">{st.name}</div>
                        <span className="text-indigo-600 text-[10px]">{st.stage}</span>
                      </td>

                      <td className="p-3 text-slate-600 space-y-1">
                        <div>📅 <span className="font-mono">{st.regDate || '2026-10-31'}</span></div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-emerald-600 font-mono text-[11px]">🕒 {st.lastSeen || 'الآن'}</span>
                          <button onClick={async () => {
                            await updateDoc(doc(db, 'students', st.id), { status: 'غير متصل' });
                            setStudentsList(studentsList.map(item => item.id === st.id ? {...item, status: 'غير متصل'} : item));
                            setSuccessMessage(`تم فك الارتباط بنجاح للطالب ${st.name}!`);
                            setTimeout(() => setSuccessMessage(null), 3000);
                          }} className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded text-[10px] font-black cursor-pointer flex items-center gap-1" title="فك ارتباط الجهاز وإتاحة الدخول">
                            <UnlockIcon className="w-3 h-3" /> فك الارتباط 🔓
                          </button>
                        </div>
                      </td>

                      <td className="p-3">
                        {editingStudentId === st.id ? (
                          <div className="flex flex-col gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-indigo-200">
                            <input type="text" value={editStudentName} onChange={(e) => setEditStudentName(e.target.value)} placeholder="الاسم..." className="px-2 py-1 rounded bg-white border text-xs font-bold" />
                            <input type="text" value={editStudentUser} onChange={(e) => setEditStudentUser(e.target.value)} placeholder="اليوزر..." className="px-2 py-1 rounded bg-white border text-xs font-bold font-mono" />
                            <input type="text" value={editStudentPass} onChange={(e) => setEditStudentPass(e.target.value)} placeholder="الباسورد..." className="px-2 py-1 rounded bg-white border text-xs font-bold font-mono" />
                            <select value={editStudentStage} onChange={(e) => setEditStudentStage(e.target.value)} className="px-2 py-1 rounded bg-white border text-xs font-bold">
                              {allStagesList.map(s => (
                                <option key={s.id} value={s.name}>{s.name}</option>
                              ))}
                            </select>
                            <div className="flex gap-2 pt-1">
                              <button onClick={async () => {
                                await updateDoc(doc(db, 'students', st.id), {
                                  name: editStudentName,
                                  username: editStudentUser,
                                  pass: editStudentPass,
                                  stage: editStudentStage
                                });
                                setStudentsList(studentsList.map(item => item.id === st.id ? {
                                  ...item,
                                  name: editStudentName,
                                  username: editStudentUser,
                                  pass: editStudentPass,
                                  stage: editStudentStage
                                } : item));
                                setEditingStudentId(null);
                                setSuccessMessage('تم تحديث بيانات الطالب بنجاح!');
                                setTimeout(() => setSuccessMessage(null), 3000);
                              }} className="px-3 py-1 bg-emerald-600 text-white rounded text-[11px] font-bold cursor-pointer">حفظ</button>
                              <button onClick={() => setEditingStudentId(null)} className="px-3 py-1 bg-slate-200 rounded text-[11px] cursor-pointer">إلغاء</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border gap-2">
                            <div>
                              <div className="text-slate-900">👤 يوزر: <span className="font-mono text-indigo-700">{st.username}</span></div>
                              <div className="text-slate-600">🔑 باسورد: <span className="font-mono">{st.pass}</span></div>
                            </div>
                            <button onClick={() => {
                              setEditingStudentId(st.id);
                              setEditStudentName(st.name);
                              setEditStudentUser(st.username);
                              setEditStudentPass(st.pass);
                              setEditStudentStage(st.stage);
                            }} className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs cursor-pointer hover:bg-indigo-100" title="تعديل بيانات الطالب">
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="p-3 space-y-1">
                        <div className="text-amber-600 font-black">{st.examScore}</div>
                        <button onClick={async () => {
                          const newVip = !st.isVip;
                          await updateDoc(doc(db, 'students', st.id), { isVip: newVip });
                          setStudentsList(studentsList.map(item => item.id === st.id ? {...item, isVip: newVip} : item));
                        }} className={`px-2 py-0.5 rounded text-[10px] font-black cursor-pointer ${st.isVip ? 'bg-amber-500 text-white' : 'bg-slate-200'}`}>
                          {st.isVip ? '⭐ VIP مفعّل' : 'عادي'}
                        </button>
                      </td>

                      <td className="p-3 text-center space-y-1">
                        {st.examDetails && (
                          <button onClick={() => setViewingStudentAnswers(st)} className="px-2 py-1 bg-indigo-600 text-white rounded text-[10px] font-bold cursor-pointer block mx-auto">
                            🔍 عرض الأخطاء
                          </button>
                        )}
                        <button onClick={async () => {
                          if (window.confirm('حذف هذا الطالب نهائياً؟')) {
                            await deleteDoc(doc(db, 'students', st.id));
                            setStudentsList(studentsList.filter(item => item.id !== st.id));
                          }
                        }} className="text-rose-500 p-1 block mx-auto cursor-pointer" title="حذف الطالب"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. إضافة المواد */}
        {activeTab === 'adminPanel' && isAdmin && (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-xl border border-emerald-200 space-y-4 w-full">
            <h2 className="text-xl font-black text-slate-900">إضافة مادة دراسية جديدة</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!newSubName) return;
              const foundStageObj = allStagesList.find(st => st.id === newSubStage || st.name === newSubStage);
              const newObj = {
                name: newSubName,
                stage: foundStageObj ? foundStageObj.id : 'third_intermediate',
                stageName: foundStageObj ? foundStageObj.name : newSubStage,
                icon: '📚',
                color: 'from-blue-600 to-indigo-800',
                image: newSubImage || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=500&q=80',
                videos: [], booklets: [], notes: [], quizzes: []
              };
              const docRef = await addDoc(collection(db, 'subjects'), newObj);
              setSubjects([{ id: docRef.id, ...newObj }, ...subjects]);
              setNewSubName(''); setNewSubImage('');
              setSuccessMessage('تمت إضافة المادة بنجاح!');
              setTimeout(() => setSuccessMessage(null), 3000);
            }} className="space-y-3">
              <input type="text" required value={newSubName} onChange={(e) => setNewSubName(e.target.value)} placeholder="اسم المادة (مثال: الرياضيات)..." className="w-full px-3 py-2.5 border rounded-xl text-xs font-bold" />
              <select value={newSubStage} onChange={(e) => setNewSubStage(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-xs font-bold">
                {allStagesList.map(st => (
                  <option key={st.id} value={st.name}>{st.name}</option>
                ))}
              </select>
              <input type="text" value={newSubImage} onChange={(e) => setNewSubImage(e.target.value)} placeholder="رابط صورة الغلاف (اختياري)..." className="w-full px-3 py-2.5 border rounded-xl text-xs font-mono" />
              <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl text-xs shadow cursor-pointer">نشر المادة في المنصة</button>
            </form>
          </div>
        )}

        {/* 5. إعدادات VIP */}
        {activeTab === 'vipSettings' && isAdmin && (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-xl border space-y-4 w-full">
            <h2 className="text-xl font-black text-slate-900">إعدادات أسعار وطرق دفع VIP</h2>
            <form onSubmit={(e) => {
