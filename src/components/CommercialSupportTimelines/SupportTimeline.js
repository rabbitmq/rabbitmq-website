import React, {useId, useState} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Link from '@docusaurus/Link';
import styles from './SupportTimeline.module.css';

const DAY = 24 * 60 * 60 * 1000;

export default function SupportTimeline({rows, now}) {
  const [showMore, setShowMore] = useState(false);
  const chartId = useId();

  if (rows.length === 0) {
    return null;
  }

  // Like Spring's timeline, keep supported series and the most recent older
  // series visible. The remaining series can be expanded with "More".
  const latestUnsupported = rows.find((row) => !row.isPlanned && !row.isCommercialSupported);
  const visibleRows = showMore
    ? rows
    : rows.filter((row) => row.isPlanned || row.isCommercialSupported || row === latestUnsupported);
  const hasOlderReleases = visibleRows.length < rows.length || showMore;
  const firstYear = Math.min(
    new Date(now).getUTCFullYear(),
    ...visibleRows.map((row) => row.releaseDateValue.getUTCFullYear())
  );
  const futureYear = Math.max(
    2032,
    new Date(now).getUTCFullYear(),
    ...rows.map((row) => row.endOfCommercialSupportDate.getUTCFullYear())
  ) + 1;
  const start = Date.UTC(firstYear, 0, 1);
  const end = Date.UTC(futureYear, 0, 1);
  const position = (date) => Math.max(0, Math.min(100, (date - start) / (end - start) * 100));
  const period = (from, to) => ({
    left: `${position(from)}%`,
    width: `${Math.max(0, position(to) - position(from))}%`,
  });
  const years = Array.from({length: futureYear - firstYear + 1}, (_, index) => firstYear + index);

  return (
    <div className={styles.supportTimeline}>
      <div className={styles.chartScroll}>
        <div id={chartId} className={styles.chart} role="figure" aria-label="RabbitMQ release support timelines">
          <div className={styles.axis} aria-hidden="true">
            {years.map((year) => (
              <div key={year} className={styles.year} style={{left: `${position(Date.UTC(year, 0, 1))}%`}}>
                <span>{year === futureYear ? 'Future' : year}</span>
              </div>
            ))}
          </div>
          <div className={styles.releases}>
            {visibleRows.map((row) => {
              const isFuture = row.isPlanned;
              const releaseStatus = styles[row.supportPhase];
              // Support dates in the table include the final day of support.
              const enterpriseEnd = row.endOfCommercialSupportDate.getTime() + DAY;
              const ossEnd = row.endOfCommunitySupportDate
                ? row.endOfCommunitySupportDate.getTime() + DAY
                : enterpriseEnd;
              const description = `${row.release}: ${isFuture ? 'planned release' : 'released'} ${row.releaseDate}; community support until ${row.endOfCommunitySupport}; commercial support until ${row.endOfCommercialSupport}; supported with Expert Services afterwards.`;

              return (
                <div key={row.release} className={styles.release} role="img" aria-label={description}>
                  <span className={`${styles.releaseLabel} ${releaseStatus}`}>{row.release}.x</span>
                  <span className={`${styles.bar} ${styles.enterprise}`} style={period(row.releaseDateValue, enterpriseEnd)} />
                  <span className={`${styles.bar} ${styles.expert}`} style={period(enterpriseEnd, end)} />
                  <span className={`${styles.bar} ${isFuture ? styles.future : styles.ossBar}`} style={period(row.releaseDateValue, ossEnd)} />
                </div>
              );
            })}
          </div>
          <BrowserOnly>
            {() => {
              const currentTime = Date.now();
              const today = new Date(currentTime).toISOString().slice(0, 10);
              return (
                <div className={styles.currentDate} style={{left: `${position(currentTime)}%`}}>
                  <time dateTime={today}>{today}</time>
                </div>
              );
            }}
          </BrowserOnly>
        </div>
      </div>
      {hasOlderReleases && (
        <button type="button" className={styles.showMore} aria-expanded={showMore} aria-controls={chartId} onClick={() => setShowMore(!showMore)}>
          {showMore ? 'Less' : 'More'}
          <span className={`${styles.chevron} ${showMore ? styles.expanded : ''}`} aria-hidden="true" />
        </button>
      )}
      <dl className={styles.legend}>
        <div className={styles.legendItem}>
          <dt><span className={`${styles.swatch} ${styles.oss}`} aria-hidden="true" />Community support</dt>
          <dd>Free security updates and bugfixes with support from the RabbitMQ community.</dd>
        </div>
        <div className={styles.legendItem}>
          <dt><span className={`${styles.swatch} ${styles.enterprise}`} aria-hidden="true" />Commercial support</dt>
          <dd>Commercial support from RabbitMQ experts during the community support timeline, plus extended support after the end of community support.</dd>
        </div>
        <div className={styles.legendItem}>
          <dt><span className={`${styles.swatch} ${styles.expert}`} aria-hidden="true" />Supported with Expert Services</dt>
          <dd>Dedicated expertise to guide and assist with RabbitMQ patching and upgrade planning long after standard support timelines have ended.</dd>
        </div>
        <div className={styles.legendItem}>
          <dt><span className={`${styles.swatch} ${styles.future}`} aria-hidden="true" />Future release</dt>
          <dd>Generation not yet released, timeline is subject to changes.</dd>
        </div>
      </dl>
    </div>
  );
}
