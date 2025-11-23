import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Row, Spin, Typography } from 'antd';
import styles from './Stats.module.css';
import type { ActivityPoint, CategoriesChart, DecisionsDistribution, StatsSummary } from '../../types/stats.types';
import { formatPercent, formatSecondsToTime, formatShortDate } from './StatsUtils';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

const API_URL_BACK =
  import.meta.env.VITE_API_URL_BACK ?? 'http://localhost:3001';

export const Stats: React.FC = () => {
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [activity, setActivity] = useState<ActivityPoint[]>([]);
  const [decisions, setDecisions] = useState<DecisionsDistribution | null>(
    null,
  );
  const [categories, setCategories] = useState<CategoriesChart>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);

        const [summaryRes, activityRes, decisionsRes, categoriesRes] =
          await Promise.all([
            fetch(`${API_URL_BACK}/api/v1/stats/summary?period=week`),
            fetch(`${API_URL_BACK}/api/v1/stats/chart/activity?period=week`),
            fetch(`${API_URL_BACK}/api/v1/stats/chart/decisions?period=week`),
            fetch(
              `${API_URL_BACK}/api/v1/stats/chart/categories?period=week`,
            ),
          ]);

        if (
          !summaryRes.ok ||
          !activityRes.ok ||
          !decisionsRes.ok ||
          !categoriesRes.ok
        ) {
          throw new Error('Ошибка загрузки статистики');
        }

        const summaryData: StatsSummary = await summaryRes.json();
        const activityData: ActivityPoint[] = await activityRes.json();
        const decisionsData: DecisionsDistribution =
          await decisionsRes.json();
        const categoriesData: CategoriesChart = await categoriesRes.json();

        if (!cancelled) {
          setSummary(summaryData);
          setActivity(activityData);
          setDecisions(decisionsData);
          setCategories(categoriesData);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : 'Неизвестная ошибка загрузки',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchAll();

    return () => {
      cancelled = true;
    };
  }, []);

  const activityMaxTotal = useMemo(() => {
    if (!activity.length) return 0;
    return activity.reduce((max, p) => {
      const total = p.approved + p.rejected + p.requestChanges;
      return Math.max(max, total);
    }, 0);
  }, [activity]);

  const decisionsTotal = useMemo(() => {
    if (!decisions) return 0;
    return (
      decisions.approved + decisions.rejected + decisions.requestChanges
    );
  }, [decisions]);

  const categoriesMaxValue = useMemo(() => {
    const values = Object.values(categories);
    if (!values.length) return 0;
    return Math.max(...values);
  }, [categories]);

  const pieGradient = useMemo(() => {
    if (!decisions || decisionsTotal <= 0) return undefined;

    const toPercent = (value: number) => (value / decisionsTotal) * 100;

    const pa = toPercent(decisions.approved);
    const pr = toPercent(decisions.rejected);
    const pc = toPercent(decisions.requestChanges);

    const aEnd = pa;
    const rEnd = pa + pr;
    const cEnd = pa + pr + pc;

    return `conic-gradient(
      #16a34a 0 ${aEnd}%,
      #ef4444 ${aEnd}% ${rEnd}%,
      #f59e0b ${rEnd}% ${cEnd}%,
      #e5e7eb ${cEnd}% 100%
    )`;
  }, [decisions, decisionsTotal]);

  return (
    <div className={styles.statsPage}>
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title
              level={2}
              className={styles.title}
              style={{ marginBottom: 4 }}
            >
              Статистика модератора
            </Title>
            <Text type="secondary" className={styles.subtitle}>
              Данные за последнюю неделю, с разбивкой по периодам и решениям.
            </Text>
          </Col>

          <Col>
            <Link to="/list">
              <Button type="default">
                Назад к списку
              </Button>
            </Link>
          </Col>
        </Row>
      </Card>


      {error && (
        <Alert
          type="error"
          message={error}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Spin spinning={loading} tip="Загружаем статистику…">
        {!loading && !error && (
          <>
            <section className={styles.metricsSection}>
              <Row gutter={[16, 16]} align="stretch">
                <Col xs={24} sm={12} lg={6}>
                  <Card
                    size="small"
                    className={styles.metricCard}
                    style={{ height: '100%' }}
                  >
                    <div className={styles.metricTitle}>Всего проверено</div>
                    <div className={styles.metricMain}>
                      {summary?.totalReviewed ?? '-'}
                    </div>
                    <div className={styles.metricSubRow}>
                      <span>
                        Сегодня:{' '}
                        <strong>
                          {summary?.totalReviewedToday ?? '-'}
                        </strong>
                      </span>
                      <span>
                        Неделя:{' '}
                        <strong>
                          {summary?.totalReviewedThisWeek ?? '-'}
                        </strong>
                      </span>
                      <span>
                        Месяц:{' '}
                        <strong>
                          {summary?.totalReviewedThisMonth ?? '-'}
                        </strong>
                      </span>
                    </div>
                  </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                  <Card
                    size="small"
                    className={styles.metricCard}
                    style={{ height: '100%' }}
                  >
                    <div className={styles.metricTitle}>Одобрено</div>
                    <div className={styles.metricMainAccent}>
                      {formatPercent(summary?.approvedPercentage)}
                    </div>
                    <div className={styles.metricHint}>
                      Доля объявлений, прошедших модерацию.
                    </div>
                  </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                  <Card
                    size="small"
                    className={styles.metricCard}
                    style={{ height: '100%' }}
                  >
                    <div className={styles.metricTitle}>Отклонено</div>
                    <div className={styles.metricMainAccentRed}>
                      {formatPercent(summary?.rejectedPercentage)}
                    </div>
                    <div className={styles.metricSub}>
                      На доработку:{' '}
                      <strong>
                        {formatPercent(
                          summary?.requestChangesPercentage,
                        )}
                      </strong>
                    </div>
                  </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                  <Card
                    size="small"
                    className={styles.metricCard}
                    style={{ height: '100%' }}
                  >
                    <div className={styles.metricTitle}>
                      Среднее время проверки
                    </div>
                    <div className={styles.metricMain}>
                      {formatSecondsToTime(summary?.averageReviewTime)}
                    </div>
                    <div className={styles.metricHint}>
                      С момента появления объявления до принятия решения.
                    </div>
                  </Card>
                </Col>
              </Row>
            </section>

            <section className={styles.chartsSection}>
              <Row gutter={[16, 16]} align="stretch">
                <Col flex="auto">
                  <Card
                    className={styles.chartCard}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <div className={styles.chartHeader}>
                      <h2 className={styles.chartTitle}>
                        Активность за неделю
                      </h2>
                      <p className={styles.chartSubtitle}>
                        Количество проверенных объявлений по дням.
                      </p>
                    </div>

                    <div className={styles.activityChart}>
                      {activity.map((point) => {
                        const total =
                          point.approved + point.rejected + point.requestChanges;

                        const totalPercent =
                          activityMaxTotal > 0 ? (total / activityMaxTotal) * 100 : 0;

                        return (
                          <div
                            key={point.date}
                            className={styles.activityColumn}
                          >
                            <div className={styles.activityBarWrapper}>
                              <div className={styles.activityBarBackground} />

                              <div
                                className={styles.activityBarStack}
                                style={{ height: `${totalPercent}%` }}
                              >
                                <div
                                  className={styles.activityBarApproved}
                                  style={{ flexGrow: point.approved, flexBasis: 0 }}
                                />
                                <div
                                  className={styles.activityBarRejected}
                                  style={{ flexGrow: point.rejected, flexBasis: 0 }}
                                />
                                <div
                                  className={styles.activityBarRequestChanges}
                                  style={{ flexGrow: point.requestChanges, flexBasis: 0 }}
                                />
                              </div>
                            </div>

                            <div className={styles.activityLabel}>
                              {formatShortDate(point.date)}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className={styles.chartLegendRow}>
                      <span className={styles.legendItem}>
                        <span
                          className={`${styles.legendDot} ${styles.legendDotApproved}`}
                        />
                        Одобрено
                      </span>
                      <span className={styles.legendItem}>
                        <span
                          className={`${styles.legendDot} ${styles.legendDotRejected}`}
                        />
                        Отклонено
                      </span>
                      <span className={styles.legendItem}>
                        <span
                          className={`${styles.legendDot} ${styles.legendDotChanges}`}
                        />
                        На доработку
                      </span>
                    </div>
                  </Card>
                </Col>

                <Col flex="auto">
                  <Card
                    className={styles.chartCard}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <div className={styles.chartHeader}>
                      <h2 className={styles.chartTitle}>
                        Распределение решений
                      </h2>
                      <p className={styles.chartSubtitle}>
                        Доля типов решений за последнюю неделю.
                      </p>
                    </div>

                    {!decisions || decisionsTotal <= 0 ? (
                      <div className={styles.chartEmpty}>
                        Нет данных для отображения.
                      </div>
                    ) : (
                      <div className={styles.pieChartWrapper}>
                        <div
                          className={styles.pieChartCircle}
                          style={{
                            backgroundImage: pieGradient,
                          }}
                        />
                        <div className={styles.pieLegend}>
                          <div className={styles.pieLegendItem}>
                            <span
                              className={`${styles.legendDot} ${styles.legendDotApproved}`}
                            />
                            <span>Одобрено</span>
                            <strong>
                              {formatPercent(decisions.approved)}
                            </strong>
                          </div>
                          <div className={styles.pieLegendItem}>
                            <span
                              className={`${styles.legendDot} ${styles.legendDotRejected}`}
                            />
                            <span>Отклонено</span>
                            <strong>
                              {formatPercent(decisions.rejected)}
                            </strong>
                          </div>
                          <div className={styles.pieLegendItem}>
                            <span
                              className={`${styles.legendDot} ${styles.legendDotChanges}`}
                            />
                            <span>На доработку</span>
                            <strong>
                              {formatPercent(
                                decisions.requestChanges,
                              )}
                            </strong>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                </Col>
              </Row>
            </section>

            <section className={styles.categoriesSection}>
              <Card
                className={styles.chartCard}
                style={{ width: '100%' }}
              >
                <div className={styles.chartHeader}>
                  <h2 className={styles.chartTitle}>
                    Проверенные объявления по категориям
                  </h2>
                  <p className={styles.chartSubtitle}>
                    Количество объявлений, прошедших модерацию, по
                    категориям за неделю.
                  </p>
                </div>

                {Object.keys(categories).length === 0 ? (
                  <div className={styles.chartEmpty}>
                    Нет данных для отображения.
                  </div>
                ) : (
                  <div className={styles.categoriesChart}>
                    {Object.entries(categories).map(
                      ([category, value]) => {
                        const widthPercent =
                          categoriesMaxValue > 0
                            ? (value / categoriesMaxValue) * 100
                            : 0;

                        return (
                          <div
                            key={category}
                            className={styles.categoryRow}
                          >
                            <div className={styles.categoryLabel}>
                              {category}
                            </div>
                            <div className={styles.categoryBar}>
                              <div
                                className={styles.categoryBarFill}
                                style={{ width: `${widthPercent}%` }}
                              />
                            </div>
                            <div className={styles.categoryValue}>
                              {value}
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                )}
              </Card>
            </section>
          </>
        )}
      </Spin>
    </div>
  );
};
