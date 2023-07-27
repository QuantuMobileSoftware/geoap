import React, { useEffect, useMemo, useState } from 'react';

import { Header } from 'components/Header';

import { Container } from './Policy.styles';
import { RemoteServerNotification } from 'components/RemoteServerNotification';

export const Policy = () => {
  return (
    <>
      <RemoteServerNotification />
      <Header />
      <Container>
        <div>
          <h1>Soilmate.ai Privacy Policy</h1>
          <ol>
            <li>
              Introduction
              <ol>
                <li>
                  We are committed to safeguarding the privacy of our website visitors and
                  service users.
                </li>
                <li>
                  This policy applies where we are acting as a data controller with
                  respect to the personal data of our website visitors and service users;
                  in other words, where we determine the purposes and means of the
                  processing of that personal data.
                </li>
                <li>
                  We use cookies on our website. Insofar as those cookies are not strictly
                  necessary for the provision of our website and services, we will ask you
                  to consent to our use of cookies when you first visit our website.
                </li>
                <li>
                  In this policy, “we”, “us” and “our” refer to SoilMate. For more
                  information about us, see Section 11.
                </li>
              </ol>
            </li>
            <li>
              How we use your personal data
              <ol>
                <li>
                  In this Section 2 we have set out:
                  <ul>
                    <li>the general categories of personal data that we may process;</li>
                    <li>the purposes for which we may process personal data; and</li>
                    <li>the legal bases of the processing.</li>
                  </ul>
                </li>
                <li>
                  We may process data about your use of our website and services (“usage
                  data“). The usage data may include your IP address, geographical
                  location, browser type and version, operating system, referral source,
                  length of visit, page views and website navigation paths, as well as
                  information about the timing, frequency and pattern of your service use.
                  This usage data may be processed for the purposes of analysing the use
                  of the website and services. The legal basis for this processing is our
                  legitimate interests, namely monitoring and improving our website and
                  services.
                </li>
                <li>
                  We may process your account data (“account data“). The account data may
                  include your name and email address and any additional data you provided
                  in your account. The account data may be processed for the purposes of
                  operating our website, providing our services, ensuring the security of
                  our website and services, maintaining back-ups of our databases and
                  communicating with you. The legal basis for this processing is our
                  legitimate interests, namely the proper administration of our website
                  and business. If you use a third-party authentication provider (e.g.
                  “Google Login”), we use the data obtained from this provider (email and
                  name) in the same manner.
                </li>
                <li>
                  We may process information contained in any enquiry you submit to us
                  regarding goods and/or services (“enquiry data“). The enquiry data may
                  be processed for the purposes of offering, marketing and selling
                  relevant goods and/or services to you. The legal basis for this
                  processing is consent.
                </li>
                <li>
                  We may process information relating to our customer relationships,
                  including customer contact information (“customer relationship data“).
                  The customer relationship data may include your name, your employer,
                  your job title or role, your contact details, and information contained
                  in communications between us and you or your employer. The source of the
                  customer relationship data is you or your employer. The customer
                  relationship data may be processed for the purposes of managing our
                  relationships with customers, communicating with customers, keeping
                  records of those communications and promoting our products and services
                  to customers. The legal basis for this processing is our legitimate
                  interests, namely the proper management of our customer relationships.
                </li>
                <li>
                  We may process information that you provide to us for the purpose of
                  subscribing to our email notifications and/or newsletters (“notification
                  data“). The notification data may be processed for the purposes of
                  sending you the relevant notifications and/or newsletters. The legal
                  basis for this processing is consent.
                </li>
                <li>
                  We may process any of your personal data identified in this policy where
                  necessary for the establishment, exercise or defence of legal claims,
                  whether in court proceedings or in an administrative or out-of-court
                  procedure. The legal basis for this processing is our legitimate
                  interests, namely the protection and assertion of our legal rights, your
                  legal rights and the legal rights of others.
                </li>
                <li>
                  Please do not supply any other person’s personal data to us, unless we
                  prompt you to do so.
                </li>
              </ol>
            </li>
            <li>
              Providing your personal data to others
              <ol>
                <li>
                  We may disclose your name, email address and other personal data your
                  provided to us to our suppliers or subcontractors insofar as reasonably
                  necessary for the proper administration of our services.
                </li>
                <li>
                  In addition to the specific disclosures of personal data set out in this
                  Section 3, we may disclose your personal data where such disclosure is
                  necessary for compliance with a legal obligation to which we are
                  subject, or in order to protect your vital interests or the vital
                  interests of another natural person. We may also disclose your personal
                  data where such disclosure is necessary for the establishment, exercise
                  or defence of legal claims, whether in court proceedings or in an
                  administrative or out-of-court procedure.
                </li>
              </ol>
            </li>
            <li>
              International transfers of your personal data
              <ol>
                <li>
                  In this Section 4, we provide information about the circumstances in
                  which your personal data may be transferred to countries outside the
                  European Economic Area (EEA).
                </li>
                <li>
                  We have offices and facilities in Ukraine. The European Commission has
                  made an “adequacy decision” with respect to the data protection laws of
                  this country. Transfers will be protected by appropriate safeguards,
                  namely the use of standard data protection clauses adopted or approved
                  by the European Commission, a copy of which can be obtained from
                  https://ec.europa.eu/info/law/law-topic/data-protection/data-transfers-outside-eu/model-contracts-transfer-personal-data-third-countries_en
                </li>
                <li>
                  The hosting facilities for our website and services are situated in
                  Western Europe, Ukraine and may also partially be located in United
                  States. The European Commission has made an “adequacy decision” with
                  respect to the data protection laws of each of these countries.
                  Transfers to each of these countries will be protected by appropriate
                  safeguards, namely the use of standard data protection clauses adopted
                  or approved by the European Commission, a copy of which you can obtain
                  from
                  https://ec.europa.eu/info/law/law-topic/data-protection/data-transfers-outside-eu/model-contracts-transfer-personal-data-third-countries_en
                </li>
              </ol>
            </li>
            <li>
              Retaining and deleting personal data
              <ol>
                <li>
                  This Section 5 sets out our data retention policies and procedure, which
                  are designed to help ensure that we comply with our legal obligations in
                  relation to the retention and deletion of personal data.
                </li>
                <li>
                  Personal data that we process for any purpose or purposes shall not be
                  kept for longer than is necessary for that purpose or those purposes.
                </li>
                <li>
                  Notwithstanding the other provisions of this Section 6, we may retain
                  your personal data where such retention is necessary for compliance with
                  a legal obligation to which we are subject, or in order to protect your
                  vital interests or the vital interests of another natural person.
                </li>
              </ol>
            </li>
            <li>
              Amendments
              <ol>
                <li>
                  We may update this policy from time to time by publishing a new version
                  on our website.
                </li>
                <li>
                  You should check this page occasionally to ensure you are happy with any
                  changes to this policy.
                </li>
                <li>
                  We will notify of changes to this policy on our website with the date of
                  its last modifications.
                </li>
              </ol>
            </li>
            <li>
              Your rights
              <ol>
                <li>
                  In this Section 7, we have summarised the rights that you have under
                  data protection law. Some of the rights are complex, and not all of the
                  details have been included in our summaries. Accordingly, you should
                  read the relevant laws and guidance from the regulatory authorities for
                  a full explanation of these rights.
                </li>
                <li>
                  Your principal rights under data protection law are:
                  <ul>
                    <li>the right to access;</li>
                    <li>the right to rectification;</li>
                    <li>the right to erasure;</li>
                    <li>the right to restrict processing;</li>
                    <li>the right to object to processing;</li>
                    <li>the right to data portability;</li>
                    <li>the right to complain to a supervisory authority; and</li>
                    <li>the right to withdraw consent.</li>
                  </ul>
                </li>
                <li>
                  You have the right to confirmation as to whether or not we process your
                  personal data and, where we do, access to the personal data, together
                  with certain additional information. That additional information
                  includes details of the purposes of the processing, the categories of
                  personal data concerned and the recipients of the personal data.
                  Providing the rights and freedoms of others are not affected, we will
                  supply to you a copy of your personal data. The first copy will be
                  provided free of charge, but additional copies may be subject to a
                  reasonable fee. You can request a copy by contacting us at
                  support@soilmate.ai.
                </li>
                <li>
                  You have the right to have any inaccurate personal data about you
                  rectified and, taking into account the purposes of the processing, to
                  have any incomplete personal data about you completed.
                </li>
                <li>
                  In some circumstances you have the right to the erasure of your personal
                  data without undue delay. Those circumstances include: the personal data
                  are no longer necessary in relation to the purposes for which they were
                  collected or otherwise processed; you withdraw consent to consent-based
                  processing; you object to the processing under certain rules of
                  applicable data protection law; the processing is for direct marketing
                  purposes; and the personal data have been unlawfully processed. However,
                  there are exclusions of the right to erasure. The general exclusions
                  include where processing is necessary: for exercising the right of
                  freedom of expression and information; for compliance with a legal
                  obligation; or for the establishment, exercise or defence of legal
                  claims.
                </li>
                <li>
                  In some circumstances you have the right to restrict the processing of
                  your personal data. Those circumstances are: you contest the accuracy of
                  the personal data; processing is unlawful but you oppose erasure; we no
                  longer need the personal data for the purposes of our processing, but
                  you require personal data for the establishment, exercise or defence of
                  legal claims; and you have objected to processing, pending the
                  verification of that objection. Where processing has been restricted on
                  this basis, we may continue to store your personal data. However, we
                  will only otherwise process it: with your consent; for the
                  establishment, exercise or defence of legal claims; for the protection
                  of the rights of another natural or legal person; or for reasons of
                  important public interest.
                </li>
                <li>
                  You have the right to object to our processing of your personal data on
                  grounds relating to your particular situation, but only to the extent
                  that the legal basis for the processing is that the processing is
                  necessary for: the performance of a task carried out in the public
                  interest or in the exercise of any official authority vested in us; or
                  the purposes of the legitimate interests pursued by us or by a third
                  party. If you make such an objection, we will cease to process the
                  personal information unless we can demonstrate compelling legitimate
                  grounds for the processing which override your interests, rights and
                  freedoms, or the processing is for the establishment, exercise or
                  defence of legal claims.
                </li>
                <li>
                  You have the right to object to our processing of your personal data for
                  direct marketing purposes (including profiling for direct marketing
                  purposes). If you make such an objection, we will cease to process your
                  personal data for this purpose.
                </li>
                <li>
                  To the extent that the legal basis for our processing of your personal
                  data is:
                  <ul>
                    <li>consent; or</li>
                    <li>
                      that the processing is necessary for the performance of a contract
                      to which you are party or in order to take steps at your request
                      prior to entering into a contract,
                    </li>
                  </ul>
                  and such processing is carried out by automated means, you have the
                  right to receive your personal data from us in a structured, commonly
                  used and machine-readable format. However, this right does not apply
                  where it would adversely affect the rights and freedoms of others.
                </li>
                <li>
                  If you consider that our processing of your personal information
                  infringes data protection laws, you have a legal right to lodge a
                  complaint with a supervisory authority responsible for data protection.
                  You may do so in the EU member state of your habitual residence, your
                  place of work or the place of the alleged infringement.
                </li>
                <li>
                  To the extent that the legal basis for our processing of your personal
                  information is consent, you have the right to withdraw that consent at
                  any time. Withdrawal will not affect the lawfulness of processing before
                  the withdrawal.
                </li>
                <li>
                  You may exercise any of your rights in relation to your personal data by
                  written notice to us, in addition to the other methods specified in this
                  Section 7.
                </li>
              </ol>
            </li>
            <li>
              About cookies
              <ol>
                <li>
                  A cookie is a file containing an identifier (a string of letters and
                  numbers) that is sent by a web server to a web browser and is stored by
                  the browser. The identifier is then sent back to the server each time
                  the browser requests a page from the server.
                </li>
                <li>
                  Cookies may be either “persistent” cookies or “session” cookies: a
                  persistent cookie will be stored by a web browser and will remain valid
                  until its set expiry date, unless deleted by the user before the expiry
                  date; a session cookie, on the other hand, will expire at the end of the
                  user session, when the web browser is closed.
                </li>
                <li>
                  Cookies do not typically contain any information that personally
                  identifies a user, but personal information that we store about you may
                  be linked to the information stored in and obtained from cookies.
                </li>
              </ol>
            </li>
            <li>
              Cookies that we may use
              <ol>
                <li>
                  We may use cookies for the following purposes:
                  <ul>
                    <li>
                      authentication – we use cookies to identify you when you visit our
                      website and as you navigate our website;
                    </li>
                    <li>
                      status – we use cookies to help us to determine if you are logged
                      into our website;
                    </li>
                    <li>
                      personalisation – we use cookies to store information about your
                      preferences and to personalise the website for you;
                    </li>
                    <li>
                      security – we use cookies as an element of the security measures
                      used to protect user accounts, including preventing fraudulent use
                      of login credentials, and to protect our website and services
                      generally;
                    </li>
                    <li>
                      analysis – we use cookies to help us to analyse the use and
                      performance of our website and services;
                    </li>
                    <li>
                      cookie consent – we use cookies to store your preferences in
                      relation to the use of cookies more generally;
                    </li>
                  </ul>
                </li>
              </ol>
            </li>
            <li>
              Cookies used by our service providers
              <ol>
                <li>
                  Our service providers use cookies and those cookies may be stored on
                  your computer when you visit our website.
                </li>
                <li>
                  <b>Newsletter and marketing communications</b>
                  <p>
                    With the following information we inform you about the contents of our
                    newsletter as well as the registration, dispatch and statistical
                    evaluation procedure and your rights of objection. By subscribing to
                    our newsletter you agree to the receipt and the described procedures.
                    The following information informs you about the contents of our
                    newsletter as well as the registration, dispatch and statistical
                    evaluation procedure and your rights of objection. By subscribing to
                    our newsletter you agree to the reception and the described
                    procedures.
                  </p>
                  <p>
                    Content of the newsletter: We send newsletters, e-mails and other
                    electronic notifications containing advertising information
                    (hereinafter “newsletters”) only with the recipients consent or legal
                    permission. If the content of a newsletter is specifically described
                    as part of the registration, this is are decisive for the users’
                    consent. In addition, our newsletters contain information about us and
                    our services.
                  </p>
                  <p>
                    Double opt-in and logging: Subscription to our newsletter takes place
                    in a so-called double opt-in procedure. This means that after
                    registration you will receive an e-mail asking you to confirm your
                    registration. This confirmation is necessary so that no one can log in
                    with other e-mail addresses. Subscriptions to the newsletter are
                    logged in order to be able to prove the registration process in
                    accordance with legal requirements. This includes the storage of the
                    login and confirmation time.
                  </p>
                  <p>
                    The dispatch of the newsletter and the performance measurement
                    associated with it are based on the recipient’s consent pursuant to
                    Art. 6 para. 1 lit. a, Art. 7 GDPR in conjunction with § 7 para. 2 no.
                    3 UWG or, if consent is not required, on the basis of our legitimate
                    interests in direct marketing pursuant to Art. 6 para. 1 lit. f. GDPR
                    in conjunction with Section 7 para. 3 UWG. The registration procedure
                    is recorded on the basis of our legitimate interests pursuant to Art.
                    6 para. 1 lit. f GDPR. We are interested in the use of a user-friendly
                    and secure newsletter system that serves both our business interests
                    and the expectations of users and also allows us to provide proof of
                    consent. Cancellation/Withdrawal – You can cancel the receipt of our
                    newsletter at any time, i.e. withdraw your consent, through a
                    cancelation link at the end of each newsletter. In order to prove a
                    previously given consent, we may store the unsubscribed e-mail
                    addresses for up to three years on the basis of our legitimate
                    interests before deleting them. The processing of this data is limited
                    to the purpose of a possible defence against claims. An individual
                    application for cancellation is possible at any time, provided that a
                    former existence of a consent is confirmed at the same time.
                  </p>
                  <p>
                    In addition to our newsletter, we also send out marketing
                    communications by e-mail to inform our insurance customers and account
                    users about our product range as well as special promotions and
                    offers. This is done on the basis of our legitimate interest pursuant
                    to Art. 6 para. 1 lit. f GDPR. As a young company, our legitimate
                    interest is to keep our clients and account users constantly informed
                    about our expanding range of insurance products. There is no
                    recognizable overriding interest opposing this. Our clients and
                    account users are informed of this process at the time the e-mail
                    address is collected and can unsubscribe from these marketing
                    communications at any time. The balancing of interests pursuant to
                    Art. 6 (1) sentence 1 lit. f DS-GVO is therefore in favour of the
                    permissibility of processing this contact data for direct advertising
                    purposes.
                  </p>
                </li>
                <li>
                  Google Analytics. On the basis of our legitimate interests (i.e.
                  interest in the analysis, optimisation and economic operation of our
                  online offer in the sense of Art. 6 para. 1 lit. f. GDPR), in our
                  website and in all subdomains we make use of Google Analytics in
                  accordance with the following GDPR principles . Google uses cookies. The
                  information generated by the cookie about the use of the online offer by
                  the user is usually transferred to a Google server in the USA and stored
                  there.
                  <p>
                    Google is certified under the Privacy Shield Agreement and thereby
                    offers a guarantee of compliance with European privacy laws
                    (https://www.privacyshield.gov/participant?id=a2zt000000001L5AAI&status=Active).
                  </p>
                  <p>
                    Google will use this information on our behalf to evaluate the use of
                    our online services by users, to compile reports on the activities
                    within this online service and to provide us with other services
                    associated with the use of this online service and the Internet.
                    Pseudonymous user profiles of the users can be created from the
                    processed data.
                  </p>
                  <p>
                    We only use Google Analytics with IP anonymization enabled. This means
                    that the IP address of the user is shortened by Google within member
                    states of the European Union or in other contracting states of the
                    Agreement on the European Economic Area. Only in exceptional cases is
                    the full IP address transmitted to a Google server in the USA and
                    shortened there.
                  </p>
                  <p>
                    The IP address transmitted by the user’s browser is not merged with
                    other Google data. Users may refuse the use of cookies by selecting
                    the appropriate settings on their browser, they may also refuse the
                    use of cookies by selecting the appropriate settings on their browser,
                    they may refuse the collection of information by Google regarding the
                    use of cookies and the processing of such information by Google by
                    selecting the appropriate settings on their browser, and they may
                    refuse the use of cookies by selecting the appropriate settings on
                    their browser, and they may refuse the use of cookies by selecting the
                    appropriate settings on their browser, and by downloading and
                    installing the browser plug-in available at the following link:
                    http://tools.google.com/dlpage/gaoptout?hl=en.
                  </p>
                  <p>
                    Further information on the use of data by Google, setting and
                    objection options can be found in Google’s privacy policy
                    (https://policies.google.com/privacy) and in the settings for the
                    display of advertising by Google
                    (https://adssettings.google.com/authenticated).
                  </p>
                  <p>
                    The personal data of the users will be deleted or anonymized after 14
                    months.
                  </p>
                </li>
                <li>
                  Google Adwords and Conversion Measurement. On the basis of our
                  legitimate interests (i.e. interest in the analysis, optimisation and
                  economic operation of our online offer within the meaning of Art. 6
                  para. 1 lit. f. GDPR) we use the services of Google Ireland Limited,
                  Gordon House, Barrow Street, Dublin 4, Ireland, (“Google”). Google is
                  certified under the Privacy Shield Agreement and thus offers a guarantee
                  to comply with European data protection law
                  (https://www.privacyshield.gov/participant?id=a2zt000000001L5AAI&status=Active).
                  We use the online marketing tool Google “AdWords” to place ads in the
                  Google Advertising Network (e.g., in search results, in videos, on
                  websites, etc.) so that they are displayed to users who have a presumed
                  interest in the ads. This allows us to display ads for and within our
                  online offer and more specifically present users only with ads that
                  potentially correspond to their interests. For example, if a user is
                  shown ads for products in which they have displayed prior interest in
                  other online offers, this is referred to as “remarketing”. For these
                  purposes, when our website and others on which the Google Advertising
                  Network is active are accessed, Google directly executes a code from
                  Google and (re)marketing tags (invisible graphics or code, also known as
                  “web beacons”) are integrated into the website. With their help, an
                  individual cookie, i.e. a small file, is stored on the user’s device
                  (comparable technologies can also be used instead of cookies). In this
                  file it is noted which websites the user visits, which content they are
                  interested in and which offers the user has clicked on, technical
                  information on the browser and operating system, referring websites,
                  visiting time and further information on the use of the online offer. We
                  also receive an individual “conversion cookie”. The information
                  collected with the help of cookies is used by Google to generate
                  conversion statistics for us. However, we only see the total number of
                  anonymous users who clicked on our ad and were redirected to a page with
                  a conversion tracking tag. However, we do not receive any information
                  that personally identifies users. User data is processed pseudonymously
                  within the Google advertising network. This means that Google does not
                  store and process, for example, the names or e-mail addresses of users,
                  but processes the relevant data cookie-related within pseudonymous user
                  profiles. This means from Google’s point of view, the ads are not
                  managed and displayed for a specifically identified person, but for the
                  cookie holder, regardless of who this cookie holder is. This does not
                  apply if a user has expressly permitted Google to process the data
                  without this pseudonymisation. The information collected about the users
                  is transmitted to Google and stored on Google’s servers in the USA.
                  Further information on data use by Google, possible settings and
                  objections can be found in Google’s data protection declaration
                  (https://policies.google.com/technologies/ads) and in the settings for
                  the display of advertisements by Google
                  (https://adssettings.google.com/authenticated). You may also object to
                  the use of cookies for range measurement and advertising purposes via
                  the deactivation page of the network advertising initiative
                  (http://optout.networkadvertising.org/) and additionally the US website
                  (http://www.aboutads.info/choices) or the European website
                  (http://www.youronlinechoices.com/uk/your-ad-choices/).
                </li>
                <li>
                  <p>
                    Hubspot – Online Marketing Analysis / Customer Communication. On the
                    basis of our legitimate interests (i.e. interest in the analysis,
                    optimisation and economic operation of our online offer in the sense
                    of Art. 6 para. 1 lit. f. GDPR), we make use of the tool Hubspot from
                    Hubspot Inc. also for online marketing analysis and customer
                    communication. Among other, this includes content management, e-mail
                    marketing, reporting (traffic sources, accesses,…), contact
                    management, landing page tracking.
                  </p>
                  <p>
                    This tool makes use of web beacons and under certain circumstances
                    “cookies” are also set, which are stored on your computer and enable
                    us to analyse your use of the website. Hubspot analyses the collected
                    information (e.g. IP address, geographical location, type of browser,
                    duration of the visit and pages accessed) in order to generate reports
                    on the pages visited. For more information on how Hubspot works,
                    please refer to the Hubspot Inc. privacy policy at:
                    http://legal.hubspot.com/de/privacy-policy If a user generally does
                    not wish to be recorded by Hubspot, the storage of cookies can be
                    prevented at any time by appropriate browser settings.
                  </p>
                  <p>
                    Hubspot Inc., is a company based in 25 First Street, 2nd Floor,
                    Cambridge, MA 02141, USA. Hubspot Inc. is certified under the Privacy
                    Shield Agreement
                    (https://www.privacyshield.gov/participant?id=a2zt0000000TN8pAAG&status=Active).
                  </p>
                </li>
                <li>
                  Online presence in social media. We maintain online presences within
                  social networks and platforms in order to communicate with active
                  customers, interested parties and users and to inform them about our
                  services. When accessing the respective networks and platforms, the
                  terms and conditions and the data processing guidelines of their
                  respective operators apply. Unless otherwise stated in our privacy
                  policy, we process the data of users who communicate with us within
                  social networks and platforms, e.g. write articles on our websites or
                  send us messages. We maintain online presences within social networks
                  and platforms in order to communicate with active customers, interested
                  parties and users and to inform them about our services.
                  <p>
                    We would like to point out that user data can be processed outside the
                    European Union. This can pose risks for users because, for example,
                    the enforcement of users’ rights could be made more difficult. With
                    regard to US providers certified under the Privacy Shield, we would
                    like to point out that they commit themselves to comply with EU data
                    protection standards. Furthermore, user data is usually processed for
                    market research and advertising purposes. Thus, for example, user
                    profiles can be created from the user behavior and the resulting
                    interests of the users. The usage profiles can in turn be used, for
                    example, to place advertisements inside and outside the platforms that
                    presumably correspond to the interests of the users. For these
                    purposes, cookies are usually stored on the user’s computer, in which
                    the user’s usage behavior and interests are stored. Furthermore, data
                    can also be stored in the user profiles independently of the devices
                    used by the users (especially if the users are members of the
                    respective platforms and are logged in to these). The processing of
                    users’ personal data is carried out on the basis of our legitimate
                    interests in effective user information and communication with users
                    pursuant to Art. 6 para. 1 lit. f. GDPR. If the users are asked by the
                    respective providers for consent to data processing (i.e. to give
                    their consent e.g. by ticking a checkbox or confirming a button), the
                    legal basis of processing is Art. 6 para. 1 lit. a., Art. 7 GDPR. For
                    a detailed description of the respective processing and the
                    possibilities of objection (opt-out), we refer to the information
                    provided by the providers linked below. Also in the case of requests
                    for information and the assertion of user rights, we point out that
                    these can be asserted most effectively with the providers. Only the
                    providers have access to the data of the users and can directly take
                    appropriate measures and provide information. If you still need help,
                    you can contact us.
                  </p>
                  <p>
                    Facebook (Facebook Ireland Ltd., 4 Grand Canal Square, Grand Canal
                    Harbour, Dublin 2, Ireland) – Privacy Policy:
                    https://www.facebook.com/about/privacy/, Opt-Out:
                    https://www.facebook.com/settings?tab=ads and
                    http://www.youronlinechoices.com, Privacy Shield:
                    https://www.privacyshield.gov/participant?id=a2zt0000000GnywAAC&status=Active.
                  </p>
                  <p>
                    Google/ YouTube (Google 1600 Amphitheatre Parkway, Mountain View, CA,
                    94043, USA) – Privacy Policy: https://policies.google.com/privacy,
                    Opt-Out: https://adssettings.google.com/authenticated, Privacy Shield:
                    https://www.privacyshield.gov/participant?id=a2zt000000001L5AAI&status=Active.
                  </p>
                  <p>
                    Instagram (Instagram Inc., 1601 Willow Road, Menlo Park, CA, 94025,
                    USA) – Privacy Policy/ Opt-Out:
                    http://instagram.com/about/legal/privacy/.
                  </p>
                  <p>
                    Twitter (Twitter Inc., 1355 Market Street, Suite 900, San Francisco,
                    CA 94103, USA) – Privacy Policy: https://twitter.com/en/privacy,
                    Opt-Out: https://twitter.com/personalization, Privacy Shield:
                    https://www.privacyshield.gov/participant?id=a2zt000000000TORzAAO&status=Active.
                  </p>
                  <p>
                    LinkedIn (LinkedIn, 1000 W Maude Ave, Sunnyvale, California, 94085,
                    USA) – Privacy Policy https://www.linkedin.com/legal/privacy-policy
                    Opt-Out:
                    https://www.linkedin.com/psettings/guest-controls/retargeting-opt-out,
                    Privacy Shield:
                    https://www.privacyshield.gov/participant?id=a2zt0000000L0UZAA0&status=Active.
                  </p>
                </li>
                <li>
                  LinkedIn. Within our online offer, functions and contents of the
                  LinkedIn service, offered by LinkedIn 1000 W Maude Ave, Sunnyvale,
                  California, 94085, USA, can be integrated. This may include, for
                  example, content such as images, videos or texts and buttons with which
                  users can share content from this online offer within LinkedIn. If the
                  users are members of the LinkedIn platform, LinkedIn can assign the call
                  of the above contents and functions to the profiles of the users there.
                  Privacy Policy of LinkedIn:
                  https://www.linkedin.com/legal/privacy-policy. LinkedIn is certified
                  under the Privacy Shield Agreement and thus offers a guarantee to comply
                  with European data protection law
                  (https://www.privacyshield.gov/participant?id=a2zt0000000L0UZAA0&status=Active).
                  Privacy Policy: https://www.linkedin.com/legal/privacy-policy, Opt-Out:
                  https://www.linkedin.com/psettings/guest-controls/retargeting-opt-out.
                  <p>
                    On the basis of our legitimate interests (i.e. interest in the
                    analysis of our online offer in the sense of Art. 6 para. 1 lit. f.
                    GDPR), we make use of some services from LinkedIn (1000 W Maude Ave,
                    Sunnyvale, California, 94085, USA) as described below. We use the
                    site-wide Insight Tag on all our website pages to record actions taken
                    by members reaching a specific URL and also the event-specific pixel
                    to track conversions without an associated URL. The LinkedIn Insight
                    Tag enables the collection of data regarding members’ visits to your
                    website, including the URL, referrer, IP address, device and browser
                    characteristics, timestamp, and page views. This data is encrypted,
                    then de-identified within seven days, and then de-identified data is
                    deleted within 90 days. LinkedIn does not share the personal data with
                    us, it only provides aggregated reports about the website audience and
                    ad performance. LinkedIn also provides retargeting for website
                    visitors, enabling us to show personalized ads off the website by
                    using this data, but without identifying the member.
                  </p>
                  <p>
                    You can opt-out to the data processing through LinkedIn by following
                    this opt-out link: https://www.linkedin.com/psettings/advertising. In
                    case you are not a LinkedIn Member you can opt-out by going to this
                    link:
                    https://www.linkedin.com/psettings/guest-controls/retargeting-opt-out.
                    You can read LinkedIn Privacy Policy on the following link:
                    https://www.linkedin.com/legal/privacy-policy.
                  </p>
                </li>
                <li>
                  Facebook-Pixel,Custom Audiences Lead Ads and Facebook Conversion. Due to
                  our legitimate interests in the analysis, optimisation and economic
                  operation of our online offer and for these purposes the so-called
                  “Facebook pixel” of the social network Facebook, which is operated by
                  Facebook Inc., 1 Hacker Way, Menlo Park, CA 94025, USA, or, if you are
                  based in the EU, Facebook Ireland Ltd, 4 Grand Canal Square, Grand Canal
                  Harbour, Dublin 2, Ireland (“Facebook”), is used within our online
                  offer.
                  <p>
                    We use Facebook Lead Ads to obtain contact information from potential
                    customers who sign up via Facebook to receive information about our
                    products or our company. Amongst others the following information is
                    collected: Full name, email address, mobile number, postal code as
                    well as the product for which information is requested. We use the
                    information about your name to contact you personally, your email
                    address as well as the further data to send you the requested
                    information.
                  </p>
                  <p>
                    Facebook is certified under the Privacy Shield Agreement and thus
                    offers a guarantee to comply with European data protection law
                    (https://www.privacyshield.gov/participant?id=a2zt0000000GnywAAC&status=Active).
                    With the help of the Facebook pixel, Facebook is able to determine the
                    visitors of our online offer as a target group for the presentation of
                    ads (so-called “Facebook ads”). Accordingly, we use the Facebook pixel
                    to display the Facebook ads we post only to Facebook users who have
                    also shown an interest in our online offering or who have certain
                    features (e.g. interests in certain topics or products that are
                    determined by the websites visited) that we transmit to Facebook
                    (so-called “custom audiences”). We also want to use the Facebook pixel
                    to ensure that our Facebook ads meet the potential interest of users
                    and are not a nuisance. The Facebook pixel also helps us understand
                    the effectiveness of Facebook ads for statistical and market research
                    purposes by showing whether users have been redirected to our website
                    after clicking on a Facebook ad (so-called “conversion”). Facebook
                    processes the data in accordance with Facebook’s Data Usage Policy.
                    Accordingly, general information on the display of Facebook ads is
                    contained in the Facebook Data Usage Policy:
                    https://www.facebook.com/policy. For specific information and details
                    about the Facebook pixel and how it works, please visit the Facebook
                    Help section: https://www.facebook.com/business/help/651294705016616.
                    You can object to the collection by the Facebook pixel and use of your
                    data to display Facebook ads. To set what types of ads you see within
                    Facebook, you can visit the page set up by Facebook and follow the
                    instructions on usage-based advertising settings:
                    https://www.facebook.com/settings?tab=ads. The settings are
                    platform-independent, i.e. they are applied to all devices, such as
                    desktop computers or mobile devices. You may also object to the use of
                    cookies for range measurement and advertising purposes via the
                    deactivation page of the network advertising initiative
                    (http://optout.networkadvertising.org/) and additionally the US
                    website (http://www.aboutads.info/choices) or the European website
                    (http://www.youronlinechoices.com/uk/your-ad-choices/).
                  </p>
                </li>
                <li>
                  This document was created using a template from SEQ Legal
                  (https://seqlegal.com)
                </li>
              </ol>
            </li>
            <li>
              Our details
              <ol>
                <li>This website is owned and operated by SoilMate.</li>
                <li>
                  We are registered in Poland under registration number VAT: PL
                  5242935926, and our registered office is at str. Modlińska 6A/223,
                  03-216 Warszawa, Poland
                </li>
                <li>
                  You can contact us:
                  <ul>
                    <li>by post, to the postal address given above;</li>
                    <li>using our website contact form;</li>
                    <li>or at support@soilmate.ai;</li>
                  </ul>
                </li>
              </ol>
            </li>
          </ol>
        </div>
      </Container>
    </>
  );
};
